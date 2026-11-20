import 'server-only';
import { readSourceTable } from './source-table';
import type { CoverFile, FeishuRecord } from './sync-plan';

const API = 'https://open.feishu.cn/open-apis';
const TIMEOUT_MS = 20_000;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export type FeishuConfig = { appId: string; appSecret: string; baseToken: string; tableId: string };

async function call(path: string, init: RequestInit): Promise<Record<string, unknown>> {
	const response = await fetch(`${API}${path}`, {
		...init,
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	const body: unknown = await response.json();
	if (!response.ok || !body || typeof body !== 'object' || !('code' in body) || body.code !== 0) {
		const code = body && typeof body === 'object' && 'code' in body ? body.code : 'unknown';
		throw new Error(`飞书请求失败（HTTP ${response.status}，code ${code}）`);
	}
	return body as Record<string, unknown>;
}

export async function getTenantToken({ appId, appSecret }: FeishuConfig): Promise<string> {
	const body = await call('/auth/v3/tenant_access_token/internal', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
	});
	const token = body['tenant_access_token'];
	if (typeof token !== 'string' || !token) throw new Error('飞书未返回应用令牌');
	return token;
}

export function fetchRecords(config: FeishuConfig, token: string): Promise<FeishuRecord[]> {
	const table = `/base/v3/bases/${encodeURIComponent(config.baseToken)}/tables/${encodeURIComponent(config.tableId)}`;
	return readSourceTable(
		async (resource, query) =>
			(await call(`${table}/${resource}?${query}`, { headers: { authorization: `Bearer ${token}` } }))['data'],
	);
}

/** The record-scoped credential that authorizes Base attachment downloads. */
function attachmentExtra(data: unknown, recordId: string, fileToken: string): string | null {
	if (!data || typeof data !== 'object') return null;
	const attachments = (data as Record<string, unknown>)['attachments'];
	if (!attachments || typeof attachments !== 'object') return null;
	const files = (attachments as Record<string, unknown>)[recordId];
	if (!files || typeof files !== 'object') return null;
	for (const list of Object.values(files)) {
		if (!Array.isArray(list)) continue;
		for (const file of list) {
			const entry = file && typeof file === 'object' ? (file as Record<string, unknown>) : null;
			if (entry && entry['file_token'] === fileToken && typeof entry['extra_info'] === 'string')
				return entry['extra_info'] as string;
		}
	}
	return null;
}

export async function downloadCover(config: FeishuConfig, cover: CoverFile, token: string): Promise<Buffer> {
	const body = await call(
		`/base/v3/bases/${encodeURIComponent(config.baseToken)}/tables/${encodeURIComponent(config.tableId)}/get_attachments`,
		{
			method: 'POST',
			headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
			body: JSON.stringify({ record_id_list: [cover.recordId] }),
		},
	);
	const extra = attachmentExtra(body['data'], cover.recordId, cover.token);
	const url = new URL(`${API}/drive/v1/medias/${encodeURIComponent(cover.token)}/download`);
	if (extra) url.searchParams.set('extra', extra);
	const response = await fetch(url, {
		headers: { authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok || !response.body) throw new Error(`作品图下载失败（${response.status}）`);
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_IMAGE_BYTES) {
			await reader.cancel();
			throw new Error('作品图超过 20MB');
		}
		chunks.push(value);
	}
	return Buffer.concat(chunks);
}

export async function sendGroupText(config: FeishuConfig, chatId: string, text: string): Promise<void> {
	const token = await getTenantToken(config);
	await call('/im/v1/messages?receive_id_type=chat_id', {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
		body: JSON.stringify({ receive_id: chatId, msg_type: 'text', content: JSON.stringify({ text }) }),
	});
}
