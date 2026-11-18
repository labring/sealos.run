import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import pg from 'pg';
import {
	deleteProjects,
	hideProjects,
	listStoredProjects,
	listVisibleProjects,
	swapAlertKey,
	upsertProject,
} from './store.ts';
import { castVote, getVoteCounts, getVotedProjectIds, IP_VOTE_CAP } from './votes.ts';

const databaseUrl = process.env['SHOWCASE_TEST_DATABASE_URL'];
const voter = (n: number) => `c85cd505-fb10-4ff9-a8f4-${String(n).padStart(12, '0')}`;
const project = (id: string, sortWeight = 0) => ({
	id,
	name: `作品 ${id}`,
	summary: '简介',
	url: 'https://example.com/',
	coverUrl: `https://cdn.example.com/${id}.webp`,
	coverToken: `tok-${id}`,
	author: '作者',
	role: '',
	prompt: '',
	highlights: [{ title: '亮点', detail: '说明' }],
	sortWeight,
});

test('projects and votes round-trip through PostgreSQL', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	const schema = `showcase_test_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		const sql = await readFile('db/showcase.sql', 'utf8');
		await client.query(sql);
		await client.query(sql); // re-running the schema is safe

		await upsertProject(client, project('a'));
		await upsertProject(client, project('b', 5));
		assert.deepEqual(
			(await listVisibleProjects(client)).map((item) => item.id),
			['b', 'a'],
		);
		assert.deepEqual((await listVisibleProjects(client))[1]?.highlights, [{ title: '亮点', detail: '说明' }]);

		// One vote per visitor; unknown projects are refused.
		const vote = (projectId: string, n: number, ipHash: string | null = null) =>
			castVote(client, { projectId, voterId: voter(n), ipHash, userAgent: 'test' });
		assert.deepEqual(await vote('a', 1), { status: 'ok', voted: true, votes: 1 });
		assert.deepEqual(await vote('a', 1), { status: 'ok', voted: true, votes: 1 });
		assert.deepEqual(await vote('a', 2), { status: 'ok', voted: true, votes: 2 });
		assert.deepEqual(await vote('b', 1), { status: 'ok', voted: true, votes: 1 });
		assert.deepEqual(await vote('ghost', 1), { status: 'unknown_project' });
		assert.deepEqual(await getVoteCounts(client), { a: 2, b: 1 });
		assert.deepEqual((await getVotedProjectIds(client, voter(1))).sort(), ['a', 'b']);

		// One IP can give a project at most IP_VOTE_CAP votes.
		for (let n = 0; n < IP_VOTE_CAP; n += 1) {
			assert.equal((await vote('b', 100 + n, 'ip1')).status, 'ok');
		}
		assert.deepEqual(await vote('b', 200, 'ip1'), { status: 'ok', voted: false, votes: 1 + IP_VOTE_CAP });
		assert.deepEqual(await vote('b', 200, 'ip2'), { status: 'ok', voted: true, votes: 2 + IP_VOTE_CAP });

		// Hiding keeps the votes but refuses new ones; listing again restores the project.
		await hideProjects(client, ['a']);
		assert.deepEqual(
			(await listVisibleProjects(client)).map((item) => item.id),
			['b'],
		);
		assert.deepEqual(await vote('a', 3), { status: 'unknown_project' });
		assert.equal((await listStoredProjects(client)).find((item) => item.id === 'a')?.hidden, true);
		await upsertProject(client, { ...project('a'), name: '改名' });
		assert.equal((await listVisibleProjects(client)).find((item) => item.id === 'a')?.name, '改名');
		assert.equal((await getVoteCounts(client))['a'], 2);

		// Deleting removes the votes too.
		await deleteProjects(client, ['a']);
		assert.equal((await getVoteCounts(client))['a'], undefined);
		assert.equal((await listStoredProjects(client)).length, 1);

		assert.equal(await swapAlertKey(client, 'failed:x'), 'ok');
		assert.equal(await swapAlertKey(client, 'failed:x'), 'failed:x');
		assert.equal(await swapAlertKey(client, 'ok'), 'failed:x');
	} finally {
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});
