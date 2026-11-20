import type { ShowcaseHighlight } from './project.ts';

/** Column names in the Feishu submissions table that the site reads. Nothing else leaves Feishu. */
export const FIELDS = {
	listed: '上架',
	review: '审核状态',
	name: '展示名',
	summary: '简介',
	cover: '封面',
	nickname: '创作者昵称 / 团队名',
	role: '作者身份',
	prompt: '一句话',
	highlights: '亮点',
	sortWeight: '排序权重',
	url: '项目线上体验链接',
	socialLinks: '社媒平台及帖子链接',
} as const;

export type FeishuRecord = { record_id: string; fields: Record<string, unknown> };
export type CoverFile = { token: string };
export type ListedRow = {
	id: string;
	name: string;
	summary: string;
	url: string;
	socialLinks: string[];
	author: string;
	role: string;
	prompt: string;
	highlights: ShowcaseHighlight[];
	sortWeight: number;
	images: CoverFile[];
};
export type ParsedRecord =
	| { id: string; listed: false }
	| { id: string; listed: true; row: ListedRow }
	| { id: string; listed: true; name: string; problem: string };

/** Text of a Feishu cell: plain string, number, rich-text segments, select options, or a link cell. */
export function textOf(value: unknown): string {
	if (value == null) return '';
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return String(value);
	if (Array.isArray(value)) {
		return value
			.map((part) => {
				if (typeof part === 'string') return part;
				if (!part || typeof part !== 'object' || typeof part.text !== 'string')
					throw new Error('文本字段格式无效');
				return part.text;
			})
			.join('')
			.trim();
	}
	if (typeof value === 'object') {
		if ('link' in value && typeof value.link === 'string') return value.link.trim();
		if ('text' in value && typeof value.text === 'string') return value.text.trim();
	}
	throw new Error('文本字段格式无效');
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

/** A creator can provide several post URLs with labels or as Markdown links. */
export function parseSocialLinks(value: string): string[] {
	const urls = value.match(/https?:\/\/(?:(?!,https?:\/\/)[^\s<>[\]，。；、])+/g) ?? [];
	return [
		...new Set(
			urls
				.map((value) => {
					let url = value.replace(/[.,;!?]+$/, '');
					const opens = (url.match(/\(/g) ?? []).length;
					let closes = (url.match(/\)/g) ?? []).length;
					while (url.endsWith(')') && closes > opens) {
						url = url.slice(0, -1);
						closes--;
					}
					return parseUrl(url);
				})
				.filter((url): url is string => url !== null),
		),
	];
}

function publicImages(value: unknown): CoverFile[] {
	if (!Array.isArray(value)) return [];
	const files = new Map<string, CoverFile>();
	for (const file of value) {
		if (!file || typeof file.file_token !== 'string' || !file.file_token) return [];
		files.set(file.file_token, { token: file.file_token });
	}
	return Array.from(files.values());
}

/** Read one Feishu row. A ticked row with missing display fields is reported, not listed. */
export function parseRecord({ record_id: id, fields }: FeishuRecord): ParsedRecord {
	if (fields[FIELDS.listed] !== true || textOf(fields[FIELDS.review]) !== '审核通过') {
		return { id, listed: false };
	}
	const name = textOf(fields[FIELDS.name]);
	const summary = textOf(fields[FIELDS.summary]);
	const author = textOf(fields[FIELDS.nickname]);
	const url = parseUrl(textOf(fields[FIELDS.url]));
	const images = publicImages(fields[FIELDS.cover]);
	const missing = [
		!name && FIELDS.name,
		!summary && FIELDS.summary,
		!author && FIELDS.nickname,
		!url && FIELDS.url,
		images.length === 0 && FIELDS.cover,
	].filter(Boolean);
	if (!url || missing.length > 0) {
		return { id, listed: true, name, problem: `缺少或无效：${missing.join('、')}` };
	}
	const weight = Number(textOf(fields[FIELDS.sortWeight]));
	if (!Number.isInteger(weight) || weight < -2147483648 || weight > 2147483647) {
		return { id, listed: true, name, problem: `${FIELDS.sortWeight}须为 -2147483648 至 2147483647 的整数` };
	}
	return {
		id,
		listed: true,
		row: {
			id,
			name,
			summary,
			url,
			socialLinks: parseSocialLinks(textOf(fields[FIELDS.socialLinks])),
			author,
			role: textOf(fields[FIELDS.role]),
			prompt: textOf(fields[FIELDS.prompt]),
			highlights: parseHighlights(textOf(fields[FIELDS.highlights])),
			sortWeight: weight,
			images,
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
	const missing = stored.filter((project) => !byId.has(project.id));
	const hiddenDeletes = missing.filter((project) => project.hidden).length;
	const removed = hides.length + missing.length - hiddenDeletes;
	if (!force && removed >= 3 && removed > visible.length / 2) {
		return { blocked: `本轮将下架 ${visible.length} 个作品中的 ${removed} 个` };
	}
	const hiddenCount = stored.length - visible.length;
	if (!force && hiddenDeletes >= 3 && hiddenDeletes > hiddenCount / 2) {
		return { blocked: `本轮将删除 ${hiddenCount} 个已下架作品中的 ${hiddenDeletes} 个及其点赞` };
	}
	return {
		blocked: null,
		upserts: records.flatMap((record) => (record.listed && 'row' in record ? [record.row] : [])),
		hides,
		deletes: missing.map((project) => project.id),
		problems: records.flatMap((record) =>
			record.listed && 'problem' in record ? [{ id: record.id, name: record.name, problem: record.problem }] : [],
		),
	};
}
