import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import pg from 'pg';
import type { ShowcaseProject } from './project.ts';
import { type PublicationServices, synchronize } from './publication.ts';
import { type FeishuRecord, FIELDS } from './sync-plan.ts';
import { castVote, getVoteCounts } from './votes.ts';

const databaseUrl = process.env['SHOWCASE_TEST_DATABASE_URL'];
const images = (tokens: string[]) => tokens.map((file_token) => ({ file_token }));
const fields = {
	[FIELDS.review]: '审核通过',
	[FIELDS.listed]: true,
	[FIELDS.name]: '相册',
	[FIELDS.summary]: '作品简介',
	[FIELDS.nickname]: '作者',
	[FIELDS.url]: 'https://project.example',
	[FIELDS.socialLinks]: '小红书 https://social.example/post/1\n头条 https://news.example/article/2',
	[FIELDS.cover]: images(['cover', 'detail']),
	联系微信: 'private-contact',
	'项目成品图 + Sealos Desktop 截图': images(['private-proof']),
};

test(
	'publishes curated images, retries interrupted delivery, and preserves votes across unlisting',
	{ skip: !databaseUrl },
	async () => {
		const db = new pg.Client({ connectionString: databaseUrl });
		await db.connect();
		const schema = `showcase_publish_${process.pid}`;
		try {
			await db.query(`create schema ${schema}`);
			await db.query(`set search_path to ${schema}`);
			await db.query(await readFile('db/showcase.sql', 'utf8'));
			let records: FeishuRecord[] = [{ record_id: 'one', fields }];
			let catalog: ShowcaseProject[] = [];
			const uploads: string[] = [];
			const messages: string[] = [];
			const services: PublicationServices = {
				readRecords: async () => records,
				storeImage: async (_id, image) => {
					uploads.push(image.token);
					return `https://cdn.example/${image.token}.webp`;
				},
				publish: async (projects) => {
					catalog = projects;
				},
				notify: async (message) => {
					messages.push(message);
				},
			};
			const sync = (overrides: Partial<PublicationServices> = {}) =>
				synchronize(db, { ...services, ...overrides }, false);
			assert.equal((await sync()).status, 'ok');
			assert.deepEqual(uploads, ['cover', 'detail']);
			assert.equal(catalog[0]?.coverUrl, 'https://cdn.example/cover.webp');
			assert.deepEqual(catalog[0]?.imageUrls, ['https://cdn.example/detail.webp']);
			assert.deepEqual(catalog[0]?.socialLinks, [
				'https://social.example/post/1',
				'https://news.example/article/2',
			]);
			assert.doesNotMatch(JSON.stringify(catalog), /private-|file_token|coverToken|sortWeight|votes/);
			await castVote(db, {
				projectId: 'one',
				voterId: '00000000-0000-4000-8000-000000000001',
			});
			records = [{ record_id: 'one', fields: { ...fields, [FIELDS.cover]: images(['detail', 'cover']) } }];
			assert.equal((await sync()).status, 'ok');
			assert.deepEqual(uploads, ['cover', 'detail']);
			assert.equal(catalog[0]?.coverUrl, 'https://cdn.example/detail.webp');
			assert.deepEqual(catalog[0]?.imageUrls, ['https://cdn.example/cover.webp']);

			const unavailable = async () => {
				throw new Error('test delivery unavailable');
			};
			assert.equal((await sync({ publish: unavailable, notify: unavailable })).alertFailed, true);
			assert.equal((await sync({ publish: unavailable })).status, 'failed');
			assert.equal(messages.length, 1);
			await sync({ publish: unavailable });
			assert.equal(messages.length, 1);
			assert.equal((await sync()).status, 'ok');
			assert.equal(messages.length, 2);
			assert.match(messages[1] ?? '', /恢复/);

			records = [
				{ record_id: 'one', fields: { ...fields, [FIELDS.name]: '更新后的名称' } },
				{ record_id: 'broken', fields: { ...fields, [FIELDS.cover]: [] } },
			];
			const invalid = await sync();
			assert.ok(invalid.status === 'failed');
			assert.match(invalid.reason, /缺少或无效/);
			assert.equal(catalog[0]?.name, '相册');
			assert.equal(
				(await db.query('select name from showcase_projects where id = $1', ['one'])).rows[0]?.name,
				'相册',
			);
			records = [
				{ record_id: 'one', fields: { ...fields, [FIELDS.name]: '更新后的名称' } },
				{ record_id: 'broken', fields: { ...fields, [FIELDS.cover]: images(['new-cover']) } },
			];
			const imageFailure = await sync({ storeImage: unavailable });
			assert.ok(imageFailure.status === 'failed');
			assert.equal(catalog[0]?.name, '相册');
			assert.equal(
				(await db.query('select name from showcase_projects where id = $1', ['one'])).rows[0]?.name,
				'相册',
			);
			records = [{ record_id: 'one', fields: { ...fields, [FIELDS.review]: { unexpected: true } } }];
			const invalidReview = await sync();
			assert.ok(invalidReview.status === 'failed');
			assert.match(invalidReview.reason, /one.*格式/);
			assert.equal(catalog[0]?.name, '相册');
			assert.equal(
				(await db.query('select hidden_at from showcase_projects where id = $1', ['one'])).rows[0]?.hidden_at,
				null,
			);
			records = [];
			assert.equal((await sync()).status, 'blocked');
			assert.equal((await sync({ readRecords: unavailable })).status, 'failed');
			assert.equal(catalog.length, 1);
			records = [{ record_id: 'one', fields: { ...fields, [FIELDS.review]: '待审核' } }];
			assert.equal((await sync()).status, 'ok');
			assert.deepEqual(catalog, []);
			assert.deepEqual(await getVoteCounts(db), { one: 1 });
			records = [{ record_id: 'another', fields: { [FIELDS.listed]: false } }];
			assert.equal((await sync()).status, 'ok');
			assert.deepEqual(await getVoteCounts(db), {});
		} finally {
			await db.query(`drop schema if exists ${schema} cascade`);
			await db.end();
		}
	},
);
