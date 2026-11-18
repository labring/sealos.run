import 'server-only';
import { type CoverFile, type FeishuRecord, FIELDS } from './sync-plan';

const API = 'https://open.feishu.cn/open-apis';
const TIMEOUT_MS = 20_000;
const MAX_COVER_BYTES = 20 * 1024 * 1024;

export type FeishuConfig = { appId: string; appSecret: string; baseToken: string; tableId: string };

async function call(path: string, init: RequestInit): Promise<Record<string, unknown>> {
	const response = await fetch(`${API}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
	const body: unknown = await response.json().catch(() => null);
	if (!body || typeof body !== 'object' || !('code' in body) || body.code !== 0) {
		const detail = body && typeof body === 'object' && 'msg' in body ? String(body.msg) : response.statusText;
		throw new Error(`飞书接口 ${path.split('?')[0]} 返回 ${response.status}：${detail}`);
	}
	return body as Record<string, unknown>;
}

export async function getTenantToken({ appId, appSecret }: FeishuConfig): Promise<string> {
	const body = await call('/auth/v3/tenant_access_token/internal', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
	});
	return String(body['tenant_access_token']);
}

const PAGE_SIZE = 200;

/**
 * Every row of the submissions table, with only the columns the site shows.
 * The Base v3 API returns a matrix: one list of column names, one row of cells per record.
 */
export async function fetchRecords(config: FeishuConfig, token: string): Promise<FeishuRecord[]> {
	const records: FeishuRecord[] = [];
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
		for (const field of Object.values(FIELDS)) query.append('field_id', field);
		const body = await call(`/base/v3/bases/${config.baseToken}/tables/${config.tableId}/records?${query}`, {
			headers: { authorization: `Bearer ${token}` },
		});
		const page = body['data'] as {
			fields?: string[];
			data?: unknown[][];
			record_id_list?: string[];
			has_more?: boolean;
		};
		const names = page.fields ?? [];
		const ids = page.record_id_list ?? [];
		(page.data ?? []).forEach((cells, row) => {
			const id = ids[row];
			if (id) {
				records.push({
					record_id: id,
					fields: Object.fromEntries(names.map((name, column) => [name, cells[column]])),
				});
			}
		});
		if (!page.has_more || ids.length === 0) return records;
	}
}

/** Download a cover attachment. The access token is only ever sent to open.feishu.cn. */
export async function downloadCover(cover: CoverFile, token: string): Promise<Buffer> {
	const fallback = `${API}/drive/v1/medias/${encodeURIComponent(cover.token)}/download`;
	const url = cover.url && new URL(cover.url).hostname === 'open.feishu.cn' ? cover.url : fallback;
	const response = await fetch(url, {
		headers: { authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`封面下载失败（${response.status}）`);
	}
	const bytes = Buffer.from(await response.arrayBuffer());
	if (bytes.length > MAX_COVER_BYTES) {
		throw new Error('封面超过 20MB');
	}
	return bytes;
}

/** Post a text message to a group as the app's bot, which must be a member of that group. */
export async function sendGroupText(config: FeishuConfig, chatId: string, text: string): Promise<void> {
	const token = await getTenantToken(config);
	await call('/im/v1/messages?receive_id_type=chat_id', {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
		body: JSON.stringify({ receive_id: chatId, msg_type: 'text', content: JSON.stringify({ text }) }),
	});
}
