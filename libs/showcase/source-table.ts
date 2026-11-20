import { z } from 'zod';
import { type FeishuRecord, FIELDS } from './sync-plan.ts';

const fieldPage = z.object({
	fields: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })),
	total: z.number().int().nonnegative(),
});
const recordPage = z.object({
	fields: z.array(z.string()),
	field_id_list: z.array(z.string()),
	record_id_list: z.array(z.string().min(1)),
	data: z.array(z.array(z.unknown())),
	has_more: z.boolean(),
	rev: z.number().int(),
});
const publicNames = new Set<string>(Object.values(FIELDS));
const requiredNames = [
	FIELDS.review,
	FIELDS.listed,
	FIELDS.name,
	FIELDS.summary,
	FIELDS.cover,
	FIELDS.nickname,
	FIELDS.url,
];

type GetPage = (resource: 'fields' | 'records', query: URLSearchParams) => Promise<unknown>;
const pageQuery = (offset: number) => new URLSearchParams({ offset: String(offset), limit: '200' });

async function publicColumns(get: GetPage): Promise<Map<string, string>> {
	const columns = new Map<string, string>();
	const names = new Set<string>();
	let total: number | undefined;
	for (;;) {
		const page = fieldPage.parse(await get('fields', pageQuery(columns.size)));
		if (total !== undefined && total !== page.total) throw new Error('飞书字段在分页读取时发生变化');
		total = page.total;
		for (const { id, name } of page.fields) {
			const redacted = name === '无权限访问字段';
			if (columns.has(id) || (!redacted && names.has(name))) throw new Error('飞书返回的字段重复');
			columns.set(id, name);
			if (!redacted) names.add(name);
		}
		if (columns.size === total) break;
		if (columns.size > total || !page.fields.length) throw new Error('飞书字段分页不完整');
	}
	const missing = requiredNames.filter((name) => !names.has(name));
	if (missing.length) throw new Error(`飞书缺少必需列 ${missing.join('、')}`);
	return new Map([...columns].filter(([, name]) => publicNames.has(name)));
}

/** An incomplete read must never be used to decide which records were deleted. */
export async function readSourceTable(get: GetPage): Promise<FeishuRecord[]> {
	const columns = await publicColumns(get);
	const records = new Map<string, FeishuRecord>();
	let revision: number | undefined;
	for (;;) {
		const query = pageQuery(records.size);
		for (const id of columns.keys()) query.append('field_id', id);
		const page = recordPage.parse(await get('records', query));
		const ids = page.field_id_list;
		if (
			ids.length !== columns.size ||
			new Set(ids).size !== columns.size ||
			page.fields.length !== ids.length ||
			ids.some((id, i) => columns.get(id) !== page.fields[i])
		)
			throw new Error('飞书返回的列与请求不一致');
		if (revision !== undefined && revision !== page.rev) throw new Error('飞书表格在分页读取时发生变化');
		revision = page.rev;
		if (page.record_id_list.length !== page.data.length || (page.has_more && !page.data.length))
			throw new Error('飞书记录分页不完整');
		for (const [index, cells] of page.data.entries()) {
			const id = page.record_id_list[index];
			if (!id || records.has(id) || cells.length !== ids.length) throw new Error('飞书返回重复记录或不完整的行');
			records.set(id, {
				record_id: id,
				fields: Object.fromEntries(page.fields.map((name, i) => [name, cells[i]])),
			});
		}
		if (!page.has_more) return Array.from(records.values());
	}
}
