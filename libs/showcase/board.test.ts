import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBoardPage, standingOf } from './board.ts';

const projects = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, name: `作品 ${id}`, author: `作者 ${id}` }));
const options = { page: 1, query: '', pageSize: 10 };

test('a board with no votes has no podium and lists everything in the given order', () => {
	const board = buildBoardPage(projects, {}, options);
	assert.deepEqual(board.podium, []);
	assert.deepEqual(
		board.rows.map((row) => [row.id, row.rank, row.toPodium]),
		[
			['a', null, 1],
			['b', null, 1],
			['c', null, 1],
			['d', null, 1],
			['e', null, 1],
		],
	);
	assert.equal(board.podiumThreshold, 1);
});

test('without live votes, published projects still support search, paging, and details', () => {
	const board = buildBoardPage(projects, null, { page: 2, query: '作者', pageSize: 2 });
	assert.deepEqual(board.podium, []);
	assert.deepEqual(
		board.rows.map((row) => [row.id, row.rank, row.votes, row.toPodium]),
		[
			['c', null, null, null],
			['d', null, null, null],
		],
	);
	assert.equal(board.matchCount, 5);
	assert.equal(board.pageCount, 3);
	assert.equal(board.podiumThreshold, null);
	assert.equal(standingOf(projects, null, 'c'), null);
});

test('only projects with a vote stand on the podium', () => {
	const board = buildBoardPage(projects, { c: 4, e: 1 }, options);
	assert.deepEqual(
		board.podium.map((project) => [project.id, project.rank, project.gap]),
		[
			['c', 1, 3],
			['e', 2, 3],
		],
	);
	assert.deepEqual(
		board.rows.map((row) => row.id),
		['a', 'b', 'd'],
	);
	assert.equal(board.rows[0]?.toPodium, 1);
});

test('with a full podium the rest must pass third place', () => {
	const board = buildBoardPage(projects, { a: 9, b: 6, c: 4, d: 2 }, options);
	assert.deepEqual(
		board.podium.map((project) => project.id),
		['a', 'b', 'c'],
	);
	assert.equal(board.podiumThreshold, 5);
	assert.deepEqual(
		board.rows.map((row) => [row.id, row.toPodium]),
		[
			['d', 3],
			['e', 5],
		],
	);
});

test('a lone leader has no gap to report', () => {
	assert.equal(buildBoardPage(projects, { b: 2 }, options).podium[0]?.gap, null);
});

test('search and paging apply to the rows, not the podium', () => {
	const board = buildBoardPage(projects, { a: 3, b: 2, c: 1 }, { page: 9, query: '作品 E', pageSize: 1 });
	assert.equal(board.podium.length, 3);
	assert.equal(board.featuredMatches, 0);
	assert.equal(board.matchCount, 1);
	assert.deepEqual([board.page, board.pageCount], [1, 1]);
	assert.deepEqual(
		board.rows.map((row) => [row.id, row.rank]),
		[['e', null]],
	);
	assert.equal(buildBoardPage(projects, { a: 3 }, { page: 2, query: '', pageSize: 3 }).rows[0]?.id, 'e');
});

test('standingOf describes a project relative to the podium', () => {
	const counts = { a: 9, b: 6, c: 4, d: 2 };
	assert.deepEqual(standingOf(projects, counts, 'a'), {
		rank: 1,
		votes: 9,
		onPodium: true,
		lead: 3,
		toLeader: null,
		toPodium: null,
	});
	assert.deepEqual(standingOf(projects, counts, 'c'), {
		rank: 3,
		votes: 4,
		onPodium: true,
		lead: null,
		toLeader: 6,
		toPodium: null,
	});
	assert.equal(standingOf(projects, counts, 'e')?.toPodium, 5);
	assert.deepEqual(standingOf(projects, {}, 'a'), {
		rank: null,
		votes: 0,
		onPodium: false,
		lead: null,
		toLeader: null,
		toPodium: 1,
	});
	assert.equal(standingOf(projects, { a: 1 }, 'a')?.lead, null);
	assert.equal(standingOf(projects, counts, 'ghost'), null);
});
