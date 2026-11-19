import assert from 'node:assert/strict';
import test from 'node:test';
import { runScheduledSync } from '../../scripts/run-showcase-sync.ts';

const endpoint = 'http://website.svc:3000/api/showcase/sync';
const secret = 'test-only';
const ok = { status: 'ok', listed: 1, hidden: 0, deleted: 0, problems: [] };

test('an internal job accepts a complete sync or an already running sync', async (t) => {
	for (const [code, body, expected] of [
		[200, ok, 'ok'],
		[409, { status: 'busy' }, 'busy'],
	] as const) {
		const request = t.mock.method(globalThis, 'fetch', async (url: URL, init: RequestInit) => {
			assert.equal(String(url), endpoint);
			assert.equal(init.method, 'POST');
			assert.equal(init.redirect, 'error');
			assert.equal(new Headers(init.headers).get('authorization'), `Bearer ${secret}`);
			assert.ok(init.signal instanceof AbortSignal);
			return Response.json(body, { status: code });
		});
		assert.equal(await runScheduledSync(endpoint, secret), expected);
		assert.equal(request.mock.callCount(), 1);
		request.mock.restore();
	}
});

test('redirects, partial work, blocked syncs, alert failures, malformed responses, and timeouts fail the job', async (t) => {
	for (const response of [
		new Response(null, { status: 301 }),
		new Response('login page'),
		new Response('{'),
		Response.json(null),
		Response.json({ status: 'ok' }),
		Response.json({ ...ok, listed: -1 }),
		Response.json({ ...ok, problems: ['row'] }),
		Response.json({ ...ok, alertFailed: true }),
		Response.json({ status: 'blocked' }, { status: 409 }),
		Response.json({ status: 'busy' }),
		Response.json({ error: 'unauthorized' }, { status: 401 }),
		Response.json({ status: 'failed' }, { status: 502 }),
		Response.json({ status: 'unconfigured' }, { status: 503 }),
	]) {
		const request = t.mock.method(globalThis, 'fetch', async () => response);
		await assert.rejects(runScheduledSync(endpoint, secret));
		request.mock.restore();
	}
	const request = t.mock.method(globalThis, 'fetch', async () => {
		throw new DOMException('timed out', 'TimeoutError');
	});
	await assert.rejects(runScheduledSync(endpoint, secret), /timed out/);
	request.mock.restore();
});

test('missing credentials and forced task URLs are refused before sending the request', async (t) => {
	const request = t.mock.method(globalThis, 'fetch', async () => Response.json(ok));
	for (const [url, key] of [
		[undefined, secret],
		[endpoint, undefined],
		[`${endpoint}?force=1`, secret],
		['http://service/', secret],
	] as const) {
		await assert.rejects(runScheduledSync(url, key));
	}
	assert.equal(request.mock.callCount(), 0);
});
