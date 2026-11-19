import assert from 'node:assert/strict';
import test from 'node:test';
import { readSourceTable } from './source-table.ts';

const names = ['上架', '审核状态', '展示名', '简介', '封面', '创作者昵称 / 团队名', '项目线上体验链接'];
const fields = names.map((name, i) => ({ id: `fld${i}`, name }));
const metadata = { fields: [...fields, { id: 'secret', name: '联系微信' }], total: 8 };
const page = (id: string, more: boolean) => ({
	fields: names,
	field_id_list: fields.map((f) => f.id),
	rev: 9,
	data: [[false, null, null, null, null, null, null]],
	record_id_list: [id],
	has_more: more,
});

test('projects available public fields and advances by rows actually returned', async () => {
	const rows = await readSourceTable(async (resource, query) => {
		if (resource === 'fields') return metadata;
		assert.deepEqual(query.getAll('field_id').sort(), fields.map((f) => f.id).sort());
		assert.equal(query.has('view_id'), false);
		const offset = query.get('offset');
		assert.ok(offset === '0' || offset === '1');
		return page(offset === '0' ? 'a' : 'b', offset === '0');
	});
	assert.deepEqual(
		rows.map((row) => row.record_id),
		['a', 'b'],
	);
});

test('incomplete, duplicate or mixed revision pages never reach reconciliation', async () => {
	for (const invalid of [
		{ ...page('b', false), rev: 10 },
		page('a', false),
		{ ...page('b', false), data: [] },
		{ ...page('b', false), fields: [] },
		{ ...page('b', false), has_more: undefined },
	]) {
		await assert.rejects(
			readSourceTable(async (resource, q) =>
				resource === 'fields' ? metadata : q.get('offset') === '0' ? page('a', true) : invalid,
			),
		);
	}
	await assert.rejects(
		readSourceTable(async () => ({ fields: fields.slice(2), total: 5 })),
		/审核状态|上架/,
	);
	for (const repeated of [fields[0], { id: 'different', name: names[0] }]) {
		await assert.rejects(
			readSourceTable(async (resource) =>
				resource === 'fields' ? { fields: [...fields, repeated], total: 8 } : page('a', false),
			),
			/字段重复/,
		);
	}
	await assert.rejects(
		readSourceTable(async (resource, query) =>
			resource === 'records'
				? page('a', false)
				: query.get('offset') === '0'
					? { fields: fields.slice(0, 3), total: 8 }
					: { fields: fields.slice(3), total: 7 },
		),
		/字段.*变化/,
	);
});
