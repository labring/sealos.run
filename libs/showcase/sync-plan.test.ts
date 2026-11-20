import assert from 'node:assert/strict';
import test from 'node:test';
import { FIELDS, parseHighlights, parseRecord, planSync, textOf } from './sync-plan.ts';

const fields = {
	审核状态: '审核通过',
	[FIELDS.listed]: true,
	[FIELDS.name]: [{ text: 'PhotoFlow', type: 'text' }],
	[FIELDS.summary]: '批量精修工具',
	[FIELDS.nickname]: '林深',
	[FIELDS.url]: { link: 'https://photoflow.example.com', text: '线上地址' },
	[FIELDS.cover]: [{ file_token: 'tok1', url: 'https://open.feishu.cn/x' }],
	[FIELDS.highlights]: '批量精修｜0.8 秒/张\n原图直传|一键选片\n\n第三条\n第四条｜不显示',
	[FIELDS.sortWeight]: 5,
};

test('textOf reads the cell shapes Feishu returns', () => {
	assert.equal(textOf(' a '), 'a');
	assert.equal(textOf(3), '3');
	assert.equal(textOf([{ text: 'a' }, { text: 'b' }]), 'ab');
	assert.equal(textOf({ link: 'https://x.test', text: 'x' }), 'https://x.test');
	assert.equal(textOf(undefined), '');
});

test('parseHighlights takes up to three `title｜detail` lines', () => {
	assert.deepEqual(parseHighlights(String(fields[FIELDS.highlights])), [
		{ title: '批量精修', detail: '0.8 秒/张' },
		{ title: '原图直传', detail: '一键选片' },
		{ title: '第三条', detail: '' },
	]);
});

test('parseRecord reads a ticked row and ignores an unticked one', () => {
	const parsed = parseRecord({ record_id: 'rec1', fields });
	assert.ok(parsed.listed && 'row' in parsed);
	assert.deepEqual(
		{ ...parsed.row, highlights: parsed.row.highlights.length },
		{
			id: 'rec1',
			name: 'PhotoFlow',
			summary: '批量精修工具',
			url: 'https://photoflow.example.com/',
			socialLinks: [],
			author: '林深',
			role: '',
			prompt: '',
			highlights: 3,
			sortWeight: 5,
			images: [{ recordId: 'rec1', token: 'tok1', url: 'https://open.feishu.cn/x' }],
		},
	);
	assert.deepEqual(parseRecord({ record_id: 'rec2', fields: { ...fields, [FIELDS.listed]: false } }), {
		id: 'rec2',
		listed: false,
	});
	assert.deepEqual(parseRecord({ record_id: 'rec3', fields: {} }), { id: 'rec3', listed: false });
});

test('approval and listing are independent publication gates', () => {
	for (const review of [null, '待审核', '审核驳回']) {
		assert.deepEqual(parseRecord({ record_id: 'rec1', fields: { ...fields, 审核状态: review } }), {
			id: 'rec1',
			listed: false,
		});
	}
});

test('only the ordered public attachments reach the gallery', () => {
	const parsed = parseRecord({
		record_id: 'rec1',
		fields: {
			...fields,
			[FIELDS.cover]: [{ file_token: 'one' }, { file_token: 'two' }],
			'项目成品图 + Sealos Desktop 截图': [{ file_token: 'private' }],
		},
	});
	assert.ok(parsed.listed && 'row' in parsed);
	assert.deepEqual(
		parsed.row.images.map((image) => image.token),
		['one', 'two'],
	);
});

test('parseRecord unwraps a link that Feishu returns as markdown', () => {
	const parsed = parseRecord({
		record_id: 'rec1',
		fields: { ...fields, [FIELDS.url]: '[https://photoflow.example.com](https://photoflow.example.com)' },
	});
	assert.equal(parsed.listed && 'row' in parsed && parsed.row.url, 'https://photoflow.example.com/');
});

test('parseRecord uses the creator nickname supplied on the application form', () => {
	const parsed = parseRecord({
		record_id: 'rec1',
		fields: { ...fields, [FIELDS.nickname]: '星夜工作室', 作者展示名: '其他名字' },
	});
	assert.equal(parsed.listed && 'row' in parsed && parsed.row.author, '星夜工作室');
});

test('creator promotion links are extracted as public HTTP(S) URLs', () => {
	const parsed = parseRecord({
		record_id: 'rec1',
		fields: {
			...fields,
			社媒平台及帖子链接:
				'小红书：[作品分享](https://social.example/post/1)\n头条：https://news.example/article/2\nhttps://social.example/post/1\njavascript:alert(1)',
		},
	});
	assert.ok(parsed.listed && 'row' in parsed);
	assert.deepEqual(parsed.row.socialLinks, ['https://social.example/post/1', 'https://news.example/article/2']);
});

test('public post links keep parentheses and separate adjacent URLs', () => {
	const parsed = parseRecord({
		record_id: 'links',
		fields: {
			...fields,
			[FIELDS.socialLinks]:
				'[作品](https://social.example/post/(one))\nhttps://news.example/a(b),https://video.example/c',
		},
	});
	assert.ok(parsed.listed && 'row' in parsed);
	assert.deepEqual(parsed.row.socialLinks, [
		'https://social.example/post/(one)',
		'https://news.example/a(b)',
		'https://video.example/c',
	]);
});

test('invalid sort weights are reported before a row reaches PostgreSQL', () => {
	for (const weight of ['3000000000', '-2147483649', '1.5', 'not a number']) {
		const result = parseRecord({ record_id: 'invalid-weight', fields: { ...fields, [FIELDS.sortWeight]: weight } });
		assert.ok(result.listed && 'problem' in result, `invalid weight ${weight} should be reported`);
		assert.match(result.problem, /排序权重/);
	}
	for (const weight of [-2147483648, 2147483647]) {
		const result = parseRecord({ record_id: 'valid-weight', fields: { ...fields, [FIELDS.sortWeight]: weight } });
		assert.ok(result.listed && 'row' in result);
		assert.equal(result.row.sortWeight, weight);
	}
});

test('parseRecord reports a ticked row with missing or invalid display fields', () => {
	const parsed = parseRecord({
		record_id: 'rec1',
		fields: { ...fields, [FIELDS.cover]: [], [FIELDS.url]: 'javascript:alert(1)', [FIELDS.name]: '' },
	});
	assert.ok(parsed.listed && 'problem' in parsed);
	for (const name of [FIELDS.name, FIELDS.url, FIELDS.cover]) {
		assert.ok(parsed.problem.includes(name));
	}
});

const listed = (id: string) => parseRecord({ record_id: id, fields });
const unlisted = (id: string) => ({ id, listed: false }) as const;
const shown = (id: string) => ({ id, hidden: false });

test('planSync lists ticked rows, hides unticked ones and deletes rows gone from Feishu', () => {
	const plan = planSync(
		[listed('a'), listed('c'), listed('d'), listed('new'), unlisted('b'), unlisted('never')],
		[shown('a'), shown('b'), shown('gone'), shown('c'), shown('d'), { id: 'oldgone', hidden: true }],
		{ force: false },
	);
	assert.ok(plan.blocked === null);
	assert.deepEqual(
		plan.upserts.map((row) => row.id),
		['a', 'c', 'd', 'new'],
	);
	assert.deepEqual(plan.hides, ['b']);
	assert.deepEqual(plan.deletes, ['gone', 'oldgone']);
});

test('blocks losing most archived projects and their votes when the source still returns live projects', () => {
	const archived = ['archived-1', 'archived-2', 'archived-3', 'archived-4'];
	const live = ['one', 'two', 'three', 'four', 'five'];
	const stored = [...live.map(shown), ...archived.map((id) => ({ id, hidden: true }))];
	const records = [...live.map(listed), unlisted('archived-1')];
	assert.ok(planSync(records, stored, { force: false }).blocked);
	const forced = planSync(records, stored, { force: true });
	assert.ok(forced.blocked === null);
	assert.deepEqual(forced.deletes, ['archived-2', 'archived-3', 'archived-4']);
	assert.equal(planSync([...records, unlisted('archived-2')], stored, { force: false }).blocked, null);
});

test('planSync leaves a ticked row with a problem in its previous state', () => {
	const broken = parseRecord({ record_id: 'a', fields: { ...fields, [FIELDS.cover]: null } });
	const plan = planSync([broken, listed('b')], [shown('a'), shown('b')], { force: false });
	assert.ok(plan.blocked === null);
	assert.deepEqual([plan.hides, plan.deletes], [[], []]);
	assert.deepEqual(
		plan.problems.map((item) => item.id),
		['a'],
	);
});

test('planSync refuses an empty table or a mass takedown unless forced', () => {
	const stored = ['a', 'b', 'c', 'd', 'e'].map(shown);
	assert.ok(planSync([], stored, { force: false }).blocked);

	const most = [listed('a'), listed('b'), unlisted('c'), unlisted('d'), unlisted('e')];
	assert.match(planSync(most, stored, { force: false }).blocked ?? '', /5 个作品中的 3 个/);
	const forced = planSync(most, stored, { force: true });
	assert.ok(forced.blocked === null);
	assert.deepEqual(forced.hides, ['c', 'd', 'e']);

	const few = [listed('a'), listed('b'), listed('c'), unlisted('d'), unlisted('e')];
	assert.equal(planSync(few, stored, { force: false }).blocked, null);
	// Small boards can always be edited: taking down two of two is not a mass takedown.
	assert.equal(planSync([unlisted('a'), unlisted('b')], [shown('a'), shown('b')], { force: false }).blocked, null);
});
