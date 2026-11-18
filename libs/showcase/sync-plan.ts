import type { ShowcaseHighlight } from './project.ts';

/** Column names in the Feishu submissions table that the site reads. Nothing else leaves Feishu. */
export const FIELDS = {
	listed: '上架',
	name: '展示名',
	summary: '简介',
	cover: '封面',
	author: '作者展示名',
	/** What the creator typed in the form; used when ops have not written a display name for them. */
	nickname: '创作者昵称 / 团队名',
	role: '作者身份',
	prompt: '一句话',
	highlights: '亮点',
	sortWeight: '排序权重',
	url: '项目线上体验链接',
} as const;

export type FeishuRecord = { record_id: string; fields: Record<string, unknown> };
export type CoverFile = { token: string; url: string | null };
export type ListedRow = {
	id: string;
	name: string;
	summary: string;
	url: string;
	author: string;
	role: string;
	prompt: string;
	highlights: ShowcaseHighlight[];
	sortWeight: number;
	cover: CoverFile;
};
export type ParsedRecord =
	| { id: string; listed: false }
	| { id: string; listed: true; row: ListedRow }
	| { id: string; listed: true; name: string; problem: string };

/** Text of a Feishu cell: plain string, number, rich-text segments, or a link cell. */
export function textOf(value: unknown): string {
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return String(value);
	if (Array.isArray(value)) {
		return value
			.map((part) => (part && typeof part === 'object' && 'text' in part ? String(part.text) : ''))
			.join('')
			.trim();
	}
	if (value && typeof value === 'object') {
		if ('link' in value && typeof value.link === 'string') return value.link.trim();
		if ('text' in value && typeof value.text === 'string') return value.text.trim();
	}
	return '';
}

/** One highlight per line, written as `标题｜说明` (full- or half-width bar). At most three are shown. */
export function parseHighlights(text: string): ShowcaseHighlight[] {
	return text
		.split('\n')
		.map((line) => line.split(/[｜|]/))
		.map(([title = '', ...detail]) => ({ title: title.trim(), detail: detail.join('|').trim() }))
		.filter((highlight) => highlight.title)
		.slice(0, 3);
}

/** A link typed into a text column comes back as markdown: `[label](https://…)`. */
function parseUrl(text: string): string | null {
	const target = /^\[[^\]]*\]\((\S+)\)$/.exec(text)?.[1] ?? text;
	try {
		const url = new URL(target);
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
	} catch {
		return null;
	}
}

function parseCover(value: unknown): CoverFile | null {
	const file: unknown = Array.isArray(value) ? value[0] : null;
	if (!file || typeof file !== 'object' || !('file_token' in file) || typeof file.file_token !== 'string') {
		return null;
	}
	return { token: file.file_token, url: 'url' in file && typeof file.url === 'string' ? file.url : null };
}

/** Read one Feishu row. A ticked row with missing display fields is reported, not listed. */
export function parseRecord({ record_id: id, fields }: FeishuRecord): ParsedRecord {
	if (fields[FIELDS.listed] !== true) {
		return { id, listed: false };
	}
	const name = textOf(fields[FIELDS.name]);
	const summary = textOf(fields[FIELDS.summary]);
	const author = textOf(fields[FIELDS.author]) || textOf(fields[FIELDS.nickname]);
	const url = parseUrl(textOf(fields[FIELDS.url]));
	const cover = parseCover(fields[FIELDS.cover]);
	const missing = [
		!name && FIELDS.name,
		!summary && FIELDS.summary,
		!author && FIELDS.author,
		!url && FIELDS.url,
		!cover && FIELDS.cover,
	].filter(Boolean);
	if (!url || !cover || missing.length > 0) {
		return { id, listed: true, name, problem: `缺少或无效：${missing.join('、')}` };
	}
	const weight = Number(textOf(fields[FIELDS.sortWeight]));
	return {
		id,
		listed: true,
		row: {
			id,
			name,
			summary,
			url,
			author,
			role: textOf(fields[FIELDS.role]),
			prompt: textOf(fields[FIELDS.prompt]),
			highlights: parseHighlights(textOf(fields[FIELDS.highlights])),
			sortWeight: Number.isSafeInteger(weight) ? weight : 0,
			cover,
		},
	};
}

export type SyncPlan =
	| { blocked: string }
	| {
			blocked: null;
			upserts: ListedRow[];
			/** Unticked in Feishu: taken off the site, votes kept. */
			hides: string[];
			/** Row gone from Feishu: removed with its votes. */
			deletes: string[];
			/** `name` is the display name, empty when the row has none yet. */
			problems: { id: string; name: string; problem: string }[];
	  };

/**
 * Decide what one sync run changes. Feishu is the source of truth, but a run
 * that would take down most of the showcase is refused unless forced: an
 * empty or filtered Feishu response must not wipe the site.
 */
export function planSync(
	records: readonly ParsedRecord[],
	stored: readonly { id: string; hidden: boolean }[],
	{ force }: { force: boolean },
): SyncPlan {
	if (records.length === 0 && !force) {
		return { blocked: '飞书表格返回 0 行' };
	}
	const byId = new Map(records.map((record) => [record.id, record]));
	const visible = stored.filter((project) => !project.hidden);
	// A ticked row with a problem keeps whatever state it had.
	const hides = visible.filter((project) => byId.get(project.id)?.listed === false).map((project) => project.id);
	const deletes = stored.filter((project) => !byId.has(project.id)).map((project) => project.id);
	const removed = hides.length + visible.filter((project) => !byId.has(project.id)).length;
	if (!force && removed >= 3 && removed > visible.length / 2) {
		return { blocked: `本轮将下架 ${visible.length} 个作品中的 ${removed} 个` };
	}
	return {
		blocked: null,
		upserts: records.flatMap((record) => (record.listed && 'row' in record ? [record.row] : [])),
		hides,
		deletes,
		problems: records.flatMap((record) =>
			record.listed && 'problem' in record ? [{ id: record.id, name: record.name, problem: record.problem }] : [],
		),
	};
}
