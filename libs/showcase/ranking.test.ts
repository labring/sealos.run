import assert from 'node:assert/strict';
import test from 'node:test';
import { podiumGap, rankProjects, votesToPodium } from './ranking.ts';

const projects = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];

test('ranks by votes, ties keep config order, missing counts are zero', () => {
	const ranked = rankProjects(projects, { a: 2, b: 5, c: 5, d: 2, ghost: 99 });
	assert.deepEqual(
		ranked.map((project) => [project.id, project.votes, project.rank]),
		[
			['b', 5, 1],
			['c', 5, 2],
			['a', 2, 3],
			['d', 2, 4],
			['e', 0, 5],
		],
	);
});

test('all-zero counts keep the configured order', () => {
	assert.deepEqual(
		rankProjects(projects, {}).map((project) => project.id),
		['a', 'b', 'c', 'd', 'e'],
	);
});

test('votesToPodium reports the votes needed to pass third place', () => {
	const ranked = rankProjects(projects, { a: 2, b: 5, c: 5, d: 2 });
	assert.equal(votesToPodium(ranked, 'b'), null);
	assert.equal(votesToPodium(ranked, 'a'), null);
	assert.equal(votesToPodium(ranked, 'd'), 1);
	assert.equal(votesToPodium(ranked, 'e'), 3);
});

test('votesToPodium is null when every project already fits on the podium', () => {
	assert.equal(votesToPodium(rankProjects(projects.slice(0, 2), {}), 'b'), null);
});

test('podiumGap gives the leader its lead and everyone else the distance to the rank above', () => {
	const ranked = rankProjects(projects, { a: 12, b: 20, c: 5, d: 5 });
	assert.equal(podiumGap(ranked, 1), 8);
	assert.equal(podiumGap(ranked, 2), 8);
	assert.equal(podiumGap(ranked, 3), 7);
	assert.equal(podiumGap(ranked, 4), 0);
});

test('podiumGap is null when there is no neighbour to compare with', () => {
	assert.equal(podiumGap(rankProjects(projects.slice(0, 1), { a: 3 }), 1), null);
	assert.equal(podiumGap(rankProjects(projects, {}), 9), null);
});
