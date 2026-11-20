import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

// Next.js supplies this guard and resolves extensionless TypeScript imports at build time.
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === 'server-only') return { url: 'data:text/javascript,', shortCircuit: true };
		if (specifier === './source-table' && context.parentURL?.endsWith('/feishu.ts')) {
			return nextResolve('./source-table.ts', context);
		}
		return nextResolve(specifier, context);
	},
});
const { downloadCover } = await import('./feishu.ts');

const config = { appId: 'app', appSecret: 'secret', baseToken: 'base', tableId: 'table' };
const image = { token: 'file1' };

test('downloads a record attachment using its Feishu authorization information', async (t) => {
	const bytes = new Uint8Array([137, 80, 78, 71]);
	t.mock.method(globalThis, 'fetch', async (address: string | URL, init: RequestInit) => {
		const url = new URL(address);
		assert.equal(new Headers(init.headers).get('authorization'), 'Bearer tenant-token');
		if (url.pathname === '/open-apis/base/v3/bases/base/tables/table/get_attachments') {
			assert.equal(init.method, 'POST');
			assert.deepEqual(JSON.parse(String(init.body)), { record_id_list: ['rec1'] });
			return Response.json({
				code: 0,
				data: {
					attachments: {
						rec1: { field1: [{ file_token: 'file1', extra_info: 'grant +/%&' }] },
						other: { field1: [{ file_token: 'file1', extra_info: 'wrong record' }] },
					},
				},
			});
		}
		if (
			url.pathname === '/open-apis/drive/v1/medias/file1/download' &&
			url.searchParams.get('extra') === 'grant +/%&'
		) {
			return new Response(bytes, { status: 200 });
		}
		return new Response(null, { status: 400 });
	});

	assert.deepEqual(await downloadCover(image, 'tenant-token', config, 'rec1'), Buffer.from(bytes));
});

test('does not download an attachment when its record authorization is missing', async (t) => {
	let downloadRequests = 0;
	t.mock.method(globalThis, 'fetch', async (address: string | URL) => {
		const url = new URL(address);
		if (url.pathname.endsWith('/get_attachments')) {
			return Response.json({
				code: 0,
				data: {
					attachments: {
						rec1: { field1: [{ file_token: 'other-file', extra_info: 'wrong file' }] },
						other: { field1: [{ file_token: 'file1', extra_info: 'wrong record' }] },
					},
				},
			});
		}
		downloadRequests++;
		return new Response(null, { status: 400 });
	});

	await assert.rejects(downloadCover(image, 'tenant-token', config, 'rec1'), /附件.*授权/);
	assert.equal(downloadRequests, 0);
});
