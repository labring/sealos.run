import 'server-only';
import type { PoolClient } from 'pg';
import { publicBucketUrl } from './catalog';
import { publishCatalog, type StorageConfig, toCoverImage, uploadCover } from './covers';
import { getShowcasePool } from './db';
import { downloadCover, type FeishuConfig, fetchRecords, getTenantToken, sendGroupText } from './feishu';
import { synchronize } from './publication';

const LOCK_ID = 7_301_533;

type SyncResult =
	| Awaited<ReturnType<typeof synchronize>>
	| { status: 'unconfigured'; missing: string[] }
	| { status: 'busy' };

function readConfig(): { feishu: FeishuConfig; storage: StorageConfig } | { missing: string[] } {
	const names = [
		'FEISHU_APP_ID',
		'FEISHU_APP_SECRET',
		'SHOWCASE_FEISHU_BASE_TOKEN',
		'SHOWCASE_FEISHU_TABLE_ID',
		'SHOWCASE_S3_ENDPOINT',
		'SHOWCASE_S3_BUCKET',
		'SHOWCASE_S3_PUBLIC_BASE_URL',
		'SHOWCASE_S3_ACCESS_KEY',
		'SHOWCASE_S3_SECRET_KEY',
	] as const;
	const env = Object.fromEntries(names.map((name) => [name, process.env[name] ?? ''])) as Record<
		(typeof names)[number],
		string
	>;
	const missing = names.filter((name) => !env[name]);
	const publicBaseUrl = publicBucketUrl();
	if (missing.length || !publicBaseUrl) return { missing };
	return {
		feishu: {
			appId: env.FEISHU_APP_ID,
			appSecret: env.FEISHU_APP_SECRET,
			baseToken: env.SHOWCASE_FEISHU_BASE_TOKEN,
			tableId: env.SHOWCASE_FEISHU_TABLE_ID,
		},
		storage: {
			endpoint: env.SHOWCASE_S3_ENDPOINT.replace(/\/+$/, ''),
			bucket: env.SHOWCASE_S3_BUCKET,
			accessKey: env.SHOWCASE_S3_ACCESS_KEY,
			secretKey: env.SHOWCASE_S3_SECRET_KEY,
			publicBaseUrl,
		},
	};
}

/** One pinned PostgreSQL session owns the lock through publication and alert delivery. */
export async function runSync({ force }: { force: boolean }): Promise<SyncResult> {
	const pool = getShowcasePool();
	const config = readConfig();
	if (!pool || 'missing' in config) {
		const missing = 'missing' in config ? config.missing : [];
		return { status: 'unconfigured', missing: pool ? missing : ['SHOWCASE_DATABASE_URL', ...missing] };
	}
	let db: PoolClient | undefined;
	let destroy = false;
	try {
		db = await pool.connect();
		const lock = await db.query('select pg_try_advisory_lock($1) as locked', [LOCK_ID]);
		if (!lock.rows[0]?.locked) return { status: 'busy' };
		try {
			let token: string;
			const chatId = process.env['SHOWCASE_ALERT_CHAT_ID'];
			return await synchronize(
				db,
				{
					readRecords: async () => {
						token = await getTenantToken(config.feishu);
						return fetchRecords(config.feishu, token);
					},
					storeImage: async (id, image) =>
						uploadCover(
							config.storage,
							id,
							image.token,
							await toCoverImage(await downloadCover(image, token)),
						),
					publish: (projects) => publishCatalog(config.storage, projects),
					notify: chatId ? (message) => sendGroupText(config.feishu, chatId, message) : undefined,
				},
				force,
			);
		} finally {
			await db.query('select pg_advisory_unlock($1)', [LOCK_ID]);
		}
	} catch (error) {
		destroy = true;
		console.error('[showcase] sync connection failed', error);
		return { status: 'failed', reason: '作品馆数据库连接失败' };
	} finally {
		db?.release(destroy);
	}
}
