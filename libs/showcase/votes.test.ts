import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import pg from 'pg';
import {
	deleteProjects,
	hideProjects,
	lastDeliveredAlert,
	listStoredProjects,
	listVisibleProjects,
	recordDeliveredAlert,
	upsertProject,
} from './store.ts';
import * as voteQueries from './votes.ts';
import { castVote, getDailyVote, getVoteCounts } from './votes.ts';

const databaseUrl = process.env['SHOWCASE_TEST_DATABASE_URL'];
const voter = (n: number) => `c85cd505-fb10-4ff9-a8f4-${String(n).padStart(12, '0')}`;
const project = (id: string, sortWeight = 0) => ({
	id,
	name: `作品 ${id}`,
	summary: '简介',
	url: 'https://example.com/',
	socialLinks: [],
	coverUrl: `https://cdn.example.com/${id}.webp`,
	coverToken: `tok-${id}`,
	gallery: [{ token: `second-${id}`, url: `https://cdn.example.com/${id}-second.webp` }],
	author: '作者',
	role: '',
	prompt: '',
	highlights: [{ title: '亮点', detail: '说明' }],
	sortWeight,
});

const vote = (client: pg.Client, projectId: string, n: number) => castVote(client, { projectId, voterId: voter(n) });

test('the server clock renews the account allowance at Beijing midnight', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	try {
		await client.query(
			'create temporary table showcase_account_votes (account_uid uuid, vote_date date, project_id text)',
		);
		await client.query("insert into showcase_account_votes values ($1, '2026-11-19', 'a')", [voter(1)]);
		const at = (instant: string) => ({
			query: (text: string, values?: unknown[]) =>
				client.query(text.replace('clock_timestamp()', `timestamptz '${instant}'`), values),
		});
		assert.deepEqual(await voteQueries.getVotingClock(at('2026-11-19 15:59:59.750+00'), voter(1)), {
			day: '2026-11-19',
			nextResetInMs: 250,
			spent: true,
			projectId: 'a',
		});
		assert.deepEqual(await voteQueries.getVotingClock(at('2026-11-19 16:00:00+00'), voter(1)), {
			day: '2026-11-20',
			nextResetInMs: 86400000,
			spent: false,
			projectId: null,
		});
	} finally {
		await client.end();
	}
});

test('a stalled live vote read times out and releases its database connection', { skip: !databaseUrl }, async () => {
	const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
	try {
		await assert.rejects(voteQueries.liveVoteQueries(pool).query('select pg_sleep(5)'), /timeout/i);
		assert.equal((await pool.query('select 1 as answer')).rows[0]?.answer, 1);
	} finally {
		await pool.end();
	}
});

test('one account has a single daily vote across all projects', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	const schema = `showcase_daily_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		await client.query(await readFile('db/showcase.sql', 'utf8'));
		await upsertProject(client, project('a'));
		await upsertProject(client, project('b'));
		assert.equal((await vote(client, 'a', 1)).status, 'ok');
		assert.equal((await vote(client, 'a', 1)).status, 'daily_limit');
		assert.equal((await vote(client, 'b', 1)).status, 'daily_limit');
		assert.deepEqual(await getVoteCounts(client), { a: 1 });
		assert.deepEqual(await getDailyVote(client, voter(1)), { spent: true, projectId: 'a' });
		assert.deepEqual(await getDailyVote(client, voter(2)), { spent: false, projectId: null });
	} finally {
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});

test('concurrent devices cannot use the same account allowance twice', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	const clients = Array.from({ length: 8 }, () => new pg.Client({ connectionString: databaseUrl }));
	await client.connect();
	const schema = `showcase_concurrent_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		await client.query(await readFile('db/showcase.sql', 'utf8'));
		await upsertProject(client, project('a'));
		await upsertProject(client, project('b'));
		await Promise.all(
			clients.map(async (db) => {
				await db.connect();
				await db.query(`set search_path to ${schema}`);
			}),
		);
		const results = await Promise.all(clients.map((db, i) => vote(db, i % 2 ? 'a' : 'b', 1)));
		assert.equal(results.filter((result) => result.status === 'ok').length, 1);
		assert.equal(results.filter((result) => result.status === 'daily_limit').length, 7);
		assert.equal(
			Object.values(await getVoteCounts(client)).reduce((sum, count) => sum + count, 0),
			1,
		);
		const otherAccounts = await Promise.all(clients.map((db, i) => vote(db, 'a', 10 + i)));
		assert.equal(otherAccounts.filter((result) => result.status === 'ok').length, 8);
	} finally {
		await Promise.all(clients.map((db) => db.end()));
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});

test('new days renew the allowance and deleting a project does not', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	const schema = `showcase_rollover_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		await client.query(await readFile('db/showcase.sql', 'utf8'));
		await upsertProject(client, project('a'));
		await upsertProject(client, project('b'));
		await client.query(
			`insert into showcase_account_votes (account_uid, vote_date, project_id)
			values ($1, (clock_timestamp() at time zone 'Asia/Shanghai')::date - 1, 'a')`,
			[voter(1)],
		);
		assert.deepEqual(await getDailyVote(client, voter(1)), { spent: false, projectId: null });
		assert.equal((await vote(client, 'a', 1)).status, 'ok');
		assert.deepEqual(await getVoteCounts(client), { a: 2 });
		await deleteProjects(client, ['a']);
		assert.deepEqual(await getDailyVote(client, voter(1)), { spent: true, projectId: null });
		assert.deepEqual(await vote(client, 'b', 1), { status: 'daily_limit', projectId: null });
		assert.deepEqual(await getVoteCounts(client), {});
	} finally {
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});

test('migration preserves old anonymous records and the new ranking ignores them', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	const schema = `showcase_migration_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		const sql = await readFile('db/showcase.sql', 'utf8');
		await client.query(sql);
		await client.query('alter table showcase_projects drop column gallery');
		await client.query(
			"insert into showcase_projects (id,name,summary,url,cover_url,cover_token,author) values ('legacy','L','S','https://example.com','https://cdn.example/old.webp','old','A')",
		);
		await client.query('insert into showcase_votes (project_id, voter_id) values ($1, $2)', ['legacy', voter(1)]);
		await client.query(sql);
		await client.query(sql);
		assert.deepEqual((await listVisibleProjects(client))[0]?.imageUrls, []);
		assert.deepEqual((await listStoredProjects(client))[0]?.images, [
			{ token: 'old', url: 'https://cdn.example/old.webp' },
		]);
		assert.deepEqual(await getVoteCounts(client), {});
		assert.equal((await client.query('select * from showcase_votes')).rowCount, 1);
		await upsertProject(client, project('a', 5));
		assert.deepEqual(
			(await listVisibleProjects(client)).map((item) => item.id),
			['a', 'legacy'],
		);
		assert.deepEqual((await listVisibleProjects(client))[0]?.highlights, [{ title: '亮点', detail: '说明' }]);
		assert.deepEqual((await listVisibleProjects(client))[0]?.imageUrls, ['https://cdn.example.com/a-second.webp']);
		assert.equal((await vote(client, 'a', 2)).status, 'ok');
		await hideProjects(client, ['a']);
		assert.equal((await vote(client, 'a', 3)).status, 'unknown_project');
		await upsertProject(client, project('a', 5));
		assert.deepEqual(await getVoteCounts(client), { a: 1 });
		assert.equal(await lastDeliveredAlert(client), 'ok');
		await recordDeliveredAlert(client, 'failed:x');
		assert.equal(await lastDeliveredAlert(client), 'failed:x');
	} finally {
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});
