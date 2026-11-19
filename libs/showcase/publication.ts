import type { ShowcaseProject } from './project.ts';
import {
	deleteProjects,
	hideProjects,
	lastDeliveredAlert,
	listStoredProjects,
	listVisibleProjects,
	type ProjectUpsert,
	recordDeliveredAlert,
	type StoredImage,
	upsertProject,
} from './store.ts';
import { type CoverFile, type FeishuRecord, parseRecord, planSync } from './sync-plan.ts';
import type { Queryable } from './votes.ts';

export type PublicationServices = {
	readRecords: () => Promise<FeishuRecord[]>;
	storeImage: (id: string, image: CoverFile) => Promise<string>;
	publish: (projects: ShowcaseProject[]) => Promise<void>;
	notify?: (message: string) => Promise<void>;
};

type PublicationResult = (
	| { status: 'blocked' | 'failed'; reason: string }
	| {
			status: 'ok';
			listed: number;
			hidden: number;
			deleted: number;
			problems: { id: string; name: string; problem: string }[];
	  }
) & { alertFailed?: true };

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

async function reconcile(db: Queryable, services: PublicationServices, force: boolean): Promise<PublicationResult> {
	const records = (await services.readRecords()).map((record) => {
		try {
			return parseRecord(record);
		} catch (error) {
			throw new Error(`「${record.record_id}」${errorMessage(error)}`);
		}
	});
	const stored = await listStoredProjects(db);
	const plan = planSync(records, stored, { force });
	if (plan.blocked !== null) return { status: 'blocked', reason: plan.blocked };
	if (plan.problems.length) {
		const details = plan.problems.map(({ id, name, problem }) => `「${name || id}」${problem}`).join('；');
		throw new Error(`作品信息需要检查：${details}`);
	}
	const storedById = new Map(stored.map((project) => [project.id, project]));
	const projects: ProjectUpsert[] = [];
	for (const { images, ...row } of plan.upserts) {
		const existing = new Map(storedById.get(row.id)?.images.map(({ token, url }) => [token, url]));
		try {
			const assets: StoredImage[] = [];
			for (const image of images) {
				const url = existing.get(image.token) ?? (await services.storeImage(row.id, image));
				assets.push({ token: image.token, url });
			}
			const [cover, ...gallery] = assets;
			if (!cover) throw new Error('缺少封面');
			projects.push({ ...row, coverToken: cover.token, coverUrl: cover.url, gallery });
		} catch (error) {
			throw new Error(`「${row.name}」图片处理失败：${errorMessage(error)}`);
		}
	}
	await db.query('begin');
	try {
		for (const project of projects) await upsertProject(db, project);
		await hideProjects(db, plan.hides);
		await deleteProjects(db, plan.deletes);
		await db.query('commit');
	} catch (error) {
		await db.query('rollback');
		throw error;
	}
	// Under the same sync lock, replace the public catalog atomically on every run, including retries.
	await services.publish(await listVisibleProjects(db));
	return {
		status: 'ok',
		listed: projects.length,
		hidden: plan.hides.length,
		deleted: plan.deletes.length,
		problems: [],
	};
}

/** Called while the sync session holds the advisory lock. */
export async function synchronize(
	db: Queryable,
	services: PublicationServices,
	force: boolean,
): Promise<PublicationResult> {
	let result: PublicationResult;
	try {
		result = await reconcile(db, services, force);
	} catch (error) {
		result = { status: 'failed', reason: errorMessage(error) };
	}
	if (!services.notify) return result;
	let key = 'ok';
	let message = '作品馆同步已恢复正常';
	if (result.status !== 'ok') {
		key = `${result.status}:${result.reason}`;
		message = `作品馆同步${result.status === 'blocked' ? '已中止' : '失败'}，${result.reason}`;
	} else if (result.problems.length) {
		const details = result.problems.map(({ id, name, problem }) => `「${name || id}」${problem}`).join('；');
		key = `problems:${details}`;
		message = `作品馆同步有 ${result.problems.length} 行需要检查：${details}`;
	}
	try {
		if ((await lastDeliveredAlert(db)) !== key) {
			await services.notify(message);
			await recordDeliveredAlert(db, key);
		}
	} catch {
		return { ...result, alertFailed: true };
	}
	return result;
}
