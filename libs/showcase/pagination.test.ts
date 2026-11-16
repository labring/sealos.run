import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageItems, paginate, parsePage } from './pagination.ts';

test('parsePage accepts only a positive whole number', () => {
	assert.equal(parsePage('1'), 1);
	assert.equal(parsePage('2'), 2);
	assert.equal(parsePage('007'), 7);
	for (const bad of [null, undefined, '', '0', '-1', '1.5', 'abc', '2abc', ' 2', '999999999999999999999']) {
		assert.equal(parsePage(bad), 1);
	}
});

test('paginate slices one page and reports where it starts', () => {
	const items = Array.from({ length: 25 }, (_, index) => index + 1);
	assert.deepEqual(paginate(items, 1, 10), {
		items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		page: 1,
		pageCount: 3,
		offset: 0,
	});
	assert.deepEqual(paginate(items, 3, 10), { items: [21, 22, 23, 24, 25], page: 3, pageCount: 3, offset: 20 });
});

test('paginate clamps a page that is out of range', () => {
	const items = Array.from({ length: 25 }, (_, index) => index + 1);
	assert.equal(paginate(items, 99, 10).page, 3);
	assert.deepEqual(paginate(items, 99, 10).items, [21, 22, 23, 24, 25]);
	assert.equal(paginate(items, 0, 10).page, 1);
	assert.equal(paginate(items, -4, 10).page, 1);
});

test('paginate keeps a single page for short and empty lists', () => {
	assert.deepEqual(paginate([1, 2, 3], 1, 10), { items: [1, 2, 3], page: 1, pageCount: 1, offset: 0 });
	assert.deepEqual(paginate([], 5, 10), { items: [], page: 1, pageCount: 1, offset: 0 });
	assert.equal(paginate(Array.from({ length: 10 }), 1, 10).pageCount, 1);
	assert.equal(paginate(Array.from({ length: 11 }), 1, 10).pageCount, 2);
});

test('getPageItems lists every page when there are few, and marks gaps when there are many', () => {
	assert.deepEqual(getPageItems(1, 1), [1]);
	assert.deepEqual(getPageItems(3, 7), [1, 2, 3, 4, 5, 6, 7]);
	assert.deepEqual(getPageItems(1, 10), [1, 2, 'ellipsis', 10]);
	assert.deepEqual(getPageItems(5, 10), [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
	assert.deepEqual(getPageItems(10, 10), [1, 'ellipsis', 9, 10]);
});
