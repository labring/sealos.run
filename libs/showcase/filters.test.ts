import assert from 'node:assert/strict';
import test from 'node:test';
import * as filters from './filters.ts';
import { paginate } from './pagination.ts';
import { rankProjects } from './ranking.ts';

const projects = [
	{ id: 'a', name: 'PhotoFlow', summary: '批量修图', author: '林深' },
	{ id: 'b', name: 'AskRepo', summary: '阅读代码仓库', author: '阿泽' },
	{ id: 'c', name: 'VoiceCard', summary: '播客金句', author: 'Mia' },
	{ id: 'd', name: 'FormPilot', summary: '设备巡检', author: '老周' },
	{ id: 'e', name: 'TarotNote', summary: '行动建议', author: '星夜' },
	{ id: 'f', name: 'SnapBill', summary: '接单报价', author: '言午' },
];

function search<T extends { name: string; author: string }>(items: readonly T[], query: string): T[] {
	assert.equal(typeof filters.searchProjects, 'function', 'work search must use project names and site author names');
	return filters.searchProjects(items, query);
}

test('work search matches project or author names and ignores case and whitespace', () => {
	assert.deepEqual(
		search(projects, '  pHoToFlOw  ').map((project) => project.id),
		['a'],
	);
	assert.deepEqual(
		search(projects, '老周').map((project) => project.id),
		['d'],
	);
	assert.deepEqual(
		search(projects, 'MIA').map((project) => project.id),
		['c'],
	);
});

test('description-only words do not match work or author search', () => {
	assert.deepEqual(search(projects, '代码'), []);
	assert.deepEqual(search(projects, '巡检'), []);
});

test('empty search returns all works and unknown names return no results', () => {
	assert.deepEqual(search(projects, ''), projects);
	assert.deepEqual(search(projects, '   '), projects);
	assert.deepEqual(search(projects, '不存在'), []);
});

test('list links retain only search and pagination, omitting page one', () => {
	assert.equal(filters.buildShowcaseHref({ page: 1, query: '' }), '/showcase');
	const url = new URL(filters.buildShowcaseHref({ page: 3, query: 'hello world' }), 'https://example.test');
	assert.equal(url.pathname, '/showcase');
	assert.equal(url.searchParams.get('page'), '3');
	assert.equal(url.searchParams.get('q'), 'hello world');
	assert.equal(url.searchParams.has('platform'), false);
	const first = new URL(filters.buildShowcaseHref({ page: 1, query: '海报 & 设计' }), 'https://example.test');
	assert.equal(first.searchParams.has('page'), false);
	assert.equal(first.searchParams.get('q'), '海报 & 设计');
});

test('large author searches paginate without losing global ranks or repeating works', () => {
	const many = Array.from({ length: 103 }, (_, index) => ({
		id: String(index),
		name: `Work ${index}`,
		author: index % 2 === 0 ? '甲作者' : '乙作者',
	}));
	const ranked = rankProjects(many, {});
	const matches = search(ranked.slice(3), '甲作者');
	const first = paginate(matches, 1, 10);
	const second = paginate(matches, 2, 10);
	assert.equal(matches.length, 50);
	assert.equal(first.items.length, 10);
	assert.equal(second.pageCount, 5);
	assert.equal(first.items[0]?.rank, 5);
	assert.equal(second.items[0]?.rank, 25);
	assert.equal(new Set([...first.items, ...second.items].map((project) => project.id)).size, 20);
});

test('search preserves global rank and the globally featured top three', () => {
	const ranked = rankProjects(projects, { a: 9, b: 8, c: 7, d: 6, e: 5, f: 4 });
	const topThree = ranked.slice(0, 3);
	assert.deepEqual(
		paginate(search(ranked.slice(3), '星夜'), 1, 10).items.map((project) => [project.id, project.rank]),
		[['e', 5]],
	);
	assert.deepEqual(
		topThree.map((project) => project.id),
		['a', 'b', 'c'],
	);
	assert.equal(paginate(search(ranked.slice(3), '不存在'), 9, 10).page, 1);
});
