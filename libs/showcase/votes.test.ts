import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import pg from 'pg';
import { castVote, getVoteCounts, getVotedProjectIds } from './votes.ts';

const databaseUrl = process.env['SHOWCASE_TEST_DATABASE_URL'];
const V1 = 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643';
const V2 = '0b1f6c1e-6f0a-4e0b-9a52-1d4b8f1f2a77';

test('votes are stored once per visitor and counted per project', { skip: !databaseUrl }, async () => {
	const client = new pg.Client({ connectionString: databaseUrl });
	await client.connect();
	const schema = `showcase_test_${process.pid}`;
	try {
		await client.query(`create schema ${schema}`);
		await client.query(`set search_path to ${schema}`);
		await client.query(await readFile('db/showcase.sql', 'utf8'));

		assert.deepEqual(await getVoteCounts(client), {});
		assert.deepEqual(await getVotedProjectIds(client, V1), []);

		await castVote(client, 'a', V1);
		await castVote(client, 'a', V1);
		await castVote(client, 'a', V2);
		await castVote(client, 'b', V1);

		assert.deepEqual(await getVoteCounts(client), { a: 2, b: 1 });
		assert.deepEqual((await getVotedProjectIds(client, V1)).sort(), ['a', 'b']);
		assert.deepEqual(await getVotedProjectIds(client, V2), ['a']);
	} finally {
		await client.query(`drop schema if exists ${schema} cascade`);
		await client.end();
	}
});
