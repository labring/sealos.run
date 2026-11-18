import 'server-only';
import { type StorageConfig, toCoverImage, uploadCover } from './covers';
import { getShowcasePool } from './db';
import { downloadCover, type FeishuConfig, fetchRecords, getTenantToken, sendGroupText } from './feishu';
import { invalidateBoard } from './load';
import { deleteProjects, hideProjects, listStoredProjects, swapAlertKey, upsertProject } from './store';
import { parseRecord, planSync } from './sync-plan';
import type { Queryable } from './votes';

const LOCK_ID = 7_301_533;

export type SyncResult =
	| { status: 'unconfigured'; missing: string[] }
	| { status: 'busy' }
	| { status: 'blocked'; reason: string }
	| { status: 'failed'; reason: string }
	| {
			status: 'ok';
			listed: number;
			hidden: number;
			deleted: number;
			problems: { id: string; name: string; problem: string }[];
	  };

function readConfig(): { feishu: FeishuConfig; storage: StorageConfig } | { missing: string[] } {
	const names = [
		'FEISHU_APP_ID',
		'FEISHU_APP_SECRET',
		'SHOWCASE_FEISHU_BASE_TOKEN',
		'SHOWCASE_FEISHU_TABLE_ID',
		'SHOWCASE_S3_ENDPOINT',
		'SHOWCASE_S3_BUCKET',
		'SHOWCASE_S3_ACCESS_KEY',
		'SHOWCASE_S3_SECRET_KEY',
	] as const;
	const env = Object.fromEntries(names.map((name) => [name, process.env[name] ?? ''])) as Record<
		(typeof names)[number],
		string
	>;
	const missing = names.filter((name) => !env[name]);
	if (missing.length > 0) {
		return { missing };
	}
	const endpoint = env.SHOWCASE_S3_ENDPOINT.replace(/\/+$/, '');
	return {
		feishu: {
			appId: env.FEISHU_APP_ID,
			appSecret: env.FEISHU_APP_SECRET,
			baseToken: env.SHOWCASE_FEISHU_BASE_TOKEN,
			tableId: env.SHOWCASE_FEISHU_TABLE_ID,
		},
		storage: {
			endpoint,
			bucket: env.SHOWCASE_S3_BUCKET,
			accessKey: env.SHOWCASE_S3_ACCESS_KEY,
			secretKey: env.SHOWCASE_S3_SECRET_KEY,
			publicBaseUrl: (
				process.env['SHOWCASE_S3_PUBLIC_BASE_URL'] || `${endpoint}/${env.SHOWCASE_S3_BUCKET}`
			).replace(/\/+$/, ''),
		},
	};
}

/**
 * Tell the ops group about a problem once, and once more when it clears.
 * `key` identifies the problem: an unchanged key sends nothing.
 */
async function report(db: Queryable, feishu: FeishuConfig, key: string, message: string): Promise<void> {
	const previous = await swapAlertKey(db, key);
	if (previous === key) return;
	const chatId = process.env['SHOWCASE_ALERT_CHAT_ID'];
	if (!chatId) return;
	const text = key === 'ok' ? '作品馆同步已恢复正常' : `作品馆同步：${message}`;
	try {
		await sendGroupText(feishu, chatId, text);
	} catch (error) {
		console.error('[showcase] failed to send the sync alert', error);
	}
}

/** Bring the site's projects in line with the Feishu table. Runs one at a time. */
export async function runSync({ force }: { force: boolean }): Promise<SyncResult> {
	const pool = getShowcasePool();
	const config = readConfig();
	if (!pool || 'missing' in config) {
		const missing = 'missing' in config ? [...config.missing] : [];
		return { status: 'unconfigured', missing: pool ? missing : ['SHOWCASE_DATABASE_URL', ...missing] };
	}

	const db = await pool.connect();
	try {
		const lock = await db.query('select pg_try_advisory_lock($1) as locked', [LOCK_ID]);
		if (!lock.rows[0]?.locked) {
			return { status: 'busy' };
		}
		try {
			const token = await getTenantToken(config.feishu);
			const records = (await fetchRecords(config.feishu, token)).map(parseRecord);
			const stored = await listStoredProjects(db);
			const plan = planSync(records, stored, { force });
			if (plan.blocked !== null) {
				await report(
					db,
					config.feishu,
					`blocked:${plan.blocked}`,
					`${plan.blocked}，已中止，请确认后手动强制同步`,
				);
				return { status: 'blocked', reason: plan.blocked };
			}

			const storedById = new Map(stored.map((project) => [project.id, project]));
			const problems = [...plan.problems];
			const ready = [];
			for (const row of plan.upserts) {
				const current = storedById.get(row.id);
				try {
					const coverUrl =
						current?.coverToken === row.cover.token
							? current.coverUrl
							: await uploadCover(
									config.storage,
									row.id,
									row.cover.token,
									await toCoverImage(await downloadCover(row.cover, token)),
								);
					ready.push({ ...row, coverUrl, coverToken: row.cover.token });
				} catch (error) {
					// The row keeps its previous state; the rest of the run goes ahead.
					problems.push({
						id: row.id,
						name: row.name,
						problem: error instanceof Error ? error.message : '封面处理失败',
					});
				}
			}

			await db.query('begin');
			try {
				for (const project of ready) {
					await upsertProject(db, project);
				}
				await hideProjects(db, plan.hides);
				await deleteProjects(db, plan.deletes);
				await db.query('commit');
			} catch (error) {
				await db.query('rollback');
				throw error;
			}
			invalidateBoard();

			// Ops know rows by their display name; the record ID is only a fallback.
			const summary = problems.map(({ id, name, problem }) => `「${name || id}」${problem}`).join('；');
			await report(
				db,
				config.feishu,
				problems.length ? `problems:${summary}` : 'ok',
				`${problems.length} 行未能上架：${summary}`,
			);
			return {
				status: 'ok',
				listed: ready.length,
				hidden: plan.hides.length,
				deleted: plan.deletes.length,
				problems,
			};
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			console.error('[showcase] sync failed', error);
			await report(db, config.feishu, `failed:${reason}`, `失败，${reason}`).catch(() => undefined);
			return { status: 'failed', reason };
		} finally {
			await db.query('select pg_advisory_unlock($1)', [LOCK_ID]);
		}
	} finally {
		db.release();
	}
}
