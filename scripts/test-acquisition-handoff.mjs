import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const modulePath = 'libs/utils/acquisition-handoff.ts';
const source = await readFile(modulePath, 'utf8');
const code = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const authority = api.ACQUISITION_AUTHORITY;
const capability = 'capability-1234567890123456789012345';
function browser() {
	const values = new Map();
	const runtime = {
		storage: {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, value),
			removeItem: (key) => values.delete(key),
		},
		href: 'https://website.test/downloads?utm_source=campaign&utm_medium=cpc&utm_campaign=launch&token=secret#fragment',
		referrer: 'https://search.test/results?secret=private',
		cookie: '_ga=GA1.1.12345.67890',
		consentUpdates: [],
		now: () => new Date('2026-10-29T00:00:00Z'),
		randomId: () => 'visitor-12345678',
	};
	return { runtime, values };
}
const granted = (runtime) => api.setAcquisitionAnalyticsConsent(runtime, true);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('no identity or source before consent; declined consent deletes stored linkage', () => {
	const { runtime, values } = browser();
	assert.deepEqual(api.readAcquisitionContext(runtime), {
		version: 1,
		consent: {
			analytics_storage: 'unspecified',
			ad_storage: 'unspecified',
			ad_user_data: 'unspecified',
			ad_personalization: 'unspecified',
		},
	});
	assert.equal(values.size, 0);
	granted(runtime);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, 'visitor-12345678');
	api.setAcquisitionAnalyticsConsent(runtime, false);
	const declined = api.readAcquisitionContext(runtime);
	assert.equal(declined.consent.analytics_storage, 'denied');
	assert.equal(declined.visitor_id, undefined);
	assert.equal(declined.source, undefined);
	assert.equal(declined.platform_ids, undefined);
	assert.equal(values.has('sealos_acquisition_visitor_v1'), false);
});

test('consented visit survives navigation and preserves first source, platform alias and raw sea_attr', () => {
	const { runtime } = browser();
	const encoded = encode({ version: 2, first_touch: { source: 'campaign', campaign: 'launch' } });
	runtime.rawAttribution = () => encoded;
	granted(runtime);
	const first = api.readAcquisitionContext(runtime);
	assert.equal(first.platform_ids.ga_client_id, '12345.67890');
	assert.equal(first.sea_attr, encoded);
	assert.equal(first.source.landing_page, 'https://website.test/downloads');
	assert.equal(first.source.referrer, 'https://search.test/results');
	assert.equal(JSON.stringify(first).includes('secret'), false);
	runtime.href = `https://website.test/app-attribution?handoff=${capability}&authority=${authority}`;
	const after = api.readAcquisitionContext(runtime);
	assert.equal(after.visitor_id, first.visitor_id);
	assert.deepEqual(after.source, first.source);
	assert.equal(after.consent.ad_user_data, 'unspecified');
});

test('ad identifiers are not forwarded on analytics-only permission', () => {
	const { runtime } = browser();
	granted(runtime);
	runtime.rawAttribution = () =>
		encode({ version: 3, first_touch: { source: 'google', click_value: 'private-gclid' } });
	assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined);
	assert.equal(api.readAcquisitionContext(runtime).source.source, 'campaign');
});

test('real consent updates override stored choices; consent defaults do not invent permission', () => {
	const { runtime } = browser();
	runtime.consentUpdates.push({ 0: 'consent', 1: 'default', 2: { analytics_storage: 'denied' } });
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'unspecified');
	granted(runtime);
	runtime.consentUpdates.push({ 0: 'consent', 1: 'update', 2: { analytics_storage: 'denied' } });
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'denied');
});

test('bridge rejects spoofed origins, credentials, paths and malformed capabilities', () => {
	const base = new URL('https://website.test/app-attribution');
	base.searchParams.set('handoff', capability);
	for (const candidate of [
		`${authority}.attacker.test`,
		authority.replace('https:', 'http:'),
		`${authority}/unexpected`,
		`${authority}?redirect=https://attacker.test`,
		authority.replace('https://', 'https://user@'),
	]) {
		base.searchParams.set('authority', candidate);
		assert.equal(api.getAcquisitionBridgeTarget(base.href), undefined, candidate);
	}
	base.searchParams.set('authority', authority);
	assert.equal(api.getAcquisitionBridgeTarget(base.href).endpoint, `${authority}/api/auth/oauth2/code/attribution`);
	base.searchParams.set('handoff', 'short');
	assert.equal(api.getAcquisitionBridgeTarget(base.href), undefined);
});

test('one browser journey issues an App code and attaches context to an OAuth attempt', async () => {
	const { runtime } = browser();
	granted(runtime);
	const requests = [];
	const request = async (url, init) => {
		requests.push({ url, init, payload: JSON.parse(init.body) });
		return Response.json({ code: capability, expires_at: '2026-10-29T00:10:00Z' });
	};
	const appLink = new URL(await api.issueAcquisitionAppLink(runtime, request));
	assert.equal(appLink.protocol, 'zcode:');
	assert.equal(appLink.host, 'sealos');
	assert.equal(appLink.pathname, '/acquisition');
	assert.equal(appLink.searchParams.get('authority'), authority);
	assert.equal(appLink.searchParams.get('code'), capability);
	assert.equal(requests[0].url, `${authority}/api/marketing/acquisition/issue`);
	const href = `https://website.test/app-attribution?authority=${encodeURIComponent(authority)}&handoff=${capability}&returnTo=https://attacker.test`;
	const continuation = await api.completeAcquisitionBridge(href, runtime, request);
	assert.equal(continuation, `${authority}/api/auth/oauth2/code/attribution?handoff=${capability}`);
	assert.equal(requests[1].payload.handoff, capability);
	assert.equal(requests[1].payload.visitor_id, requests[0].payload.visitor_id);
	assert.equal(requests[1].init.credentials, 'omit');
	assert.equal(requests[1].init.referrerPolicy, 'no-referrer');
	assert.equal('user_id' in requests[1].payload, false);
});

test('network failures still resume the fixed OAuth URL and do not invent successful App handoff', async () => {
	const { runtime } = browser();
	const href = `https://website.test/app-attribution?authority=${encodeURIComponent(authority)}&handoff=${capability}`;
	const fail = async () => {
		throw new Error('offline');
	};
	assert.equal(
		await api.completeAcquisitionBridge(href, runtime, fail),
		`${authority}/api/auth/oauth2/code/attribution?handoff=${capability}`,
	);
	await assert.rejects(api.issueAcquisitionAppLink(runtime, fail), /offline/);
	await assert.rejects(
		api.issueAcquisitionAppLink(runtime, async () =>
			Response.json({ code: capability, expires_at: '2026-10-28T00:00:00Z' }),
		),
		/Invalid acquisition/,
	);
	await assert.rejects(
		api.issueAcquisitionAppLink(runtime, async () =>
			Response.json({ code: 'bad', expires_at: '2026-10-30T00:00:00Z' }),
		),
		/Invalid acquisition/,
	);
});

test('blocked storage cannot create a stable visitor or stop OAuth continuation', async () => {
	const { runtime } = browser();
	runtime.consentUpdates.push({ event: 'sealos_consent_update', analytics_storage: 'granted' });
	runtime.storage = {
		getItem() {
			throw new Error('blocked');
		},
		setItem() {
			throw new Error('blocked');
		},
		removeItem() {
			throw new Error('blocked');
		},
	};
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	const href = `https://website.test/app-attribution?authority=${encodeURIComponent(authority)}&handoff=${capability}`;
	assert.equal(
		await api.completeAcquisitionBridge(href, runtime, async () => new Response(null, { status: 400 })),
		`${authority}/api/auth/oauth2/code/attribution?handoff=${capability}`,
	);
});

test('first campaign A and later campaign B retain separate acquisition and activation sources', () => {
	const { runtime } = browser();
	granted(runtime);
	runtime.href = 'https://website.test/?utm_source=first&utm_campaign=A';
	const first = api.readAcquisitionContext(runtime);
	runtime.href = 'https://website.test/downloads?utm_source=second&utm_campaign=B';
	runtime.referrer = 'https://website.test/';
	const activation = api.readAcquisitionContext(runtime);
	assert.equal(activation.source.campaign, 'A');
	assert.equal(activation.activation_source.campaign, 'B');
	assert.equal(activation.last_source.campaign, 'B');
	runtime.href = `https://website.test/app-attribution?authority=${encodeURIComponent(authority)}&handoff=${capability}`;
	runtime.referrer = `${authority}/api/auth/oauth2/code/authorize`;
	const resumed = api.readAcquisitionContext(runtime);
	assert.equal(resumed.visitor_id, first.visitor_id);
	assert.equal(resumed.source.campaign, 'A');
	assert.equal(resumed.activation_source.campaign, 'B');
	assert.equal(resumed.last_source.campaign, 'B');
});

test('actual GTM click_id_value respects advertising permission without rewriting raw attribution', () => {
	const { runtime } = browser();
	granted(runtime);
	const raw = encode({
		version: 3,
		first_touch: { source: 'google', click_id_type: 'gclid', click_id_value: 'private-current-field' },
	});
	runtime.rawAttribution = () => raw;
	assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined);
	assert.equal(runtime.rawAttribution(), raw);
	runtime.consentUpdates.push({ event: 'sealos_consent_update', ad_storage: 'granted', ad_user_data: 'granted' });
	assert.equal(api.readAcquisitionContext(runtime).sea_attr, raw);
	runtime.consentUpdates.push({ event: 'sealos_consent_update', ad_storage: 'denied' });
	assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined);
	assert.equal(runtime.rawAttribution(), raw);
});

test('known enhanced conversion fields require advertising permission', () => {
	for (const key of ['hashed_user_data', 'email_sha256', 'phone_sha256']) {
		const { runtime } = browser();
		granted(runtime);
		const raw = encode({ version: 3, first_touch: { source: 'google', extra: { [key]: 'synthetic-hash-only' } } });
		runtime.rawAttribution = () => raw;
		assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined, key);
		runtime.consentUpdates.push({ event: 'sealos_consent_update', ad_storage: 'granted', ad_user_data: 'granted' });
		assert.equal(api.readAcquisitionContext(runtime).sea_attr, raw, key);
		runtime.consentUpdates.push({ event: 'sealos_consent_update', ad_user_data: 'denied' });
		assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined, key);
		assert.equal(runtime.rawAttribution(), raw, key);
	}
});
