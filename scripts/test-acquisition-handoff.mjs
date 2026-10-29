import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const modulePath = 'libs/utils/acquisition-handoff.ts';
const source = await readFile(modulePath, 'utf8');
const code = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
function browser() {
	const values = new Map();
	const cookies = [];
	const runtime = {
		storage: {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, value),
			removeItem: (key) => values.delete(key),
		},
		writeCookie: (value) => cookies.push(value),
		href: 'https://sealos.run/downloads?utm_source=campaign&utm_medium=cpc&utm_campaign=launch&token=secret#fragment',
		referrer: 'https://search.test/results?secret=private',
		cookie: '_ga=GA1.1.12345.67890',
		consentUpdates: [],
		now: () => new Date('2026-10-29T00:00:00Z'),
		randomId: () => 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643',
	};
	return { runtime, values, cookies };
}
const granted = (runtime) => api.setAcquisitionAnalyticsConsent(runtime, true);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('no identity or source before consent; declined consent deletes stored linkage', () => {
	const { runtime, values } = browser();
	assert.deepEqual(api.readAcquisitionContext(runtime), {
		version: 1,
		realm: 'china',
		consent: {
			analytics_storage: 'unspecified',
			ad_storage: 'unspecified',
			ad_user_data: 'unspecified',
			ad_personalization: 'unspecified',
		},
	});
	assert.equal(values.size, 0);
	granted(runtime);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643');
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
	runtime.consentUpdates.push([
		'consent',
		'update',
		{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
	]);
	const first = api.readAcquisitionContext(runtime);
	assert.equal(first.platform_ids.ga_client_id, '12345.67890');
	assert.equal(first.sea_attr, encoded);
	assert.equal(first.source.landing_page, 'https://sealos.run/downloads');
	assert.equal(first.source.referrer, 'https://search.test/results');
	assert.equal(JSON.stringify(first).includes('secret'), false);
	runtime.href = 'https://sealos.run/downloads';
	const after = api.readAcquisitionContext(runtime);
	assert.equal(after.visitor_id, first.visitor_id);
	assert.deepEqual(after.source, first.source);
	assert.equal(after.consent.ad_user_data, 'granted');
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
	runtime.consentUpdates.push({
		event: 'sealos_consent_update',
		ad_storage: 'granted',
		ad_user_data: 'granted',
		ad_personalization: 'granted',
	});
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
		runtime.consentUpdates.push({
			event: 'sealos_consent_update',
			ad_storage: 'granted',
			ad_user_data: 'granted',
			ad_personalization: 'granted',
		});
		assert.equal(api.readAcquisitionContext(runtime).sea_attr, raw, key);
		runtime.consentUpdates.push({ event: 'sealos_consent_update', ad_user_data: 'denied' });
		assert.equal(api.readAcquisitionContext(runtime).sea_attr, undefined, key);
		assert.equal(runtime.rawAttribution(), raw, key);
	}
});

test('cross-tab denial wins over stale grants even before the granting tab rereads its choice', () => {
	const { runtime: tabA, values } = browser();
	const { runtime: tabB } = browser();
	tabB.storage = tabA.storage;
	granted(tabA);
	api.setAcquisitionAnalyticsConsent(tabB, false);
	const after = api.readAcquisitionContext(tabA);
	assert.equal(after.consent.analytics_storage, 'denied');
	assert.equal(after.visitor_id, undefined);
	assert.equal(after.platform_ids, undefined);
	assert.equal(JSON.parse(values.get('sealos_acquisition_consent_v1')).analytics_storage, 'denied');
});

test('a persisted denial survives initial queue history but a newly observed update can grant again', () => {
	const { runtime, values } = browser();
	values.set('sealos_acquisition_consent_v1', JSON.stringify({ analytics_storage: 'denied' }));
	runtime.consentUpdates.push({ event: 'sealos_consent_update', analytics_storage: 'granted' });
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	runtime.consentUpdates.push(['consent', 'update', { analytics_storage: 'granted' }]);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643');
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'granted');
});

test('cross-tab revocation also invalidates cached advertising permission', () => {
	const { runtime: tabA } = browser();
	const { runtime: tabB } = browser();
	tabB.storage = tabA.storage;
	granted(tabA);
	const raw = encode({ version: 3, first_touch: { source: 'google', click_id_value: 'synthetic-click' } });
	tabA.rawAttribution = () => raw;
	tabA.consentUpdates.push([
		'consent',
		'update',
		{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
	]);
	assert.equal(api.readAcquisitionContext(tabA).sea_attr, raw);
	api.setAcquisitionAnalyticsConsent(tabB, false);
	assert.equal(api.readAcquisitionContext(tabA).sea_attr, undefined);
	tabA.consentUpdates.push(['consent', 'update', { analytics_storage: 'granted' }]);
	const renewed = api.readAcquisitionContext(tabA);
	assert.equal(renewed.consent.analytics_storage, 'granted');
	assert.equal(renewed.consent.ad_user_data, 'unspecified');
	assert.equal(renewed.sea_attr, undefined);
});

test('consent subscriptions ignore source and visitor storage writes and detach cleanly', () => {
	const previousWindow = globalThis.window;
	const target = new EventTarget();
	globalThis.window = target;
	try {
		let calls = 0;
		const unsubscribe = api.subscribeAcquisitionConsent(() => calls++);
		const storage = (key) => target.dispatchEvent(Object.assign(new Event('storage'), { key }));
		storage('sealos_acquisition_source_v1');
		storage('sealos_acquisition_visitor_v1');
		assert.equal(calls, 0);
		storage('sealos_acquisition_consent_v1');
		storage(null);
		target.dispatchEvent(new Event('sealos_consent_update'));
		assert.equal(calls, 3);
		unsubscribe();
		storage('sealos_acquisition_consent_v1');
		assert.equal(calls, 3);
	} finally {
		if (previousWindow === undefined) delete globalThis.window;
		else globalThis.window = previousWindow;
	}
});

test('an already queued CMP denial remains fail-closed on a new page with a stored grant', () => {
	const { runtime, values } = browser();
	values.set('sealos_acquisition_consent_v1', JSON.stringify({ analytics_storage: 'granted' }));
	runtime.consentUpdates.push(['consent', 'update', { analytics_storage: 'denied' }]);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'denied');
});

test('queue truncation cannot replay a grant that preceded a consumed denial', () => {
	const { runtime } = browser();
	granted(runtime);
	runtime.consentUpdates.push(['consent', 'update', { analytics_storage: 'denied' }]);
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'denied');
	runtime.consentUpdates.splice(1);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	runtime.consentUpdates.push(['consent', 'update', { analytics_storage: 'granted' }]);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643');
});

test('a newer cross-tab grant is not vetoed by already consumed denial history', () => {
	const { runtime: tabA } = browser();
	const { runtime: tabB } = browser();
	tabB.storage = tabA.storage;
	api.setAcquisitionAnalyticsConsent(tabA, false);
	assert.equal(api.readAcquisitionConsent(tabB).analytics_storage, 'denied');
	granted(tabB);
	assert.equal(api.readAcquisitionConsent(tabA).analytics_storage, 'granted');
	assert.equal(api.readAcquisitionConsent(tabB).analytics_storage, 'granted');
});

test('a bounded queue rotation with unchanged length cannot hide a new denial', () => {
	const { runtime } = browser();
	granted(runtime);
	runtime.consentUpdates.splice(0, 1, ['consent', 'update', { analytics_storage: 'denied' }]);
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	assert.equal(api.readAcquisitionConsent(runtime).analytics_storage, 'denied');
});

// Execute the real control with browser and React boundaries supplied by the test.
// Assertions cover outbound requests, navigation and consent rather than JSX structure.
const choiceSource = await readFile('libs/components/AcquisitionChoice.tsx', 'utf8');
function choiceHarness() {
	const { runtime, values } = browser();
	const navigations = [];
	const requests = [];
	const states = [];
	let cursor = 0;
	const react = {
		useState(initial) {
			const index = cursor++;
			if (!(index in states)) states[index] = initial;
			return [
				states[index],
				(next) => {
					states[index] = next;
				},
			];
		},
		useEffect() {},
	};
	const exports = {};
	const componentApi = {
		...api,
		createBrowserAcquisitionRuntime: () => runtime,
	};
	const jsx = (type, props) => ({ type, props });
	const componentCode = ts.transpileModule(choiceSource, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
	}).outputText;
	vm.runInNewContext(componentCode, {
		exports,
		require: (name) =>
			name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : componentApi,
		window: { location: { assign: (url) => navigations.push(url) }, dispatchEvent() {} },
		Event,
	});
	const find = (node, type) => {
		if (!node || typeof node !== 'object') return;
		if (node.type === type) return node;
		for (const child of [node.props?.children].flat(Infinity)) {
			const result = find(child, type);
			if (result) return result;
		}
	};
	const render = () => {
		cursor = 0;
		return exports.AcquisitionChoice();
	};
	return { runtime, values, navigations, requests, control: (type) => find(render(), type) };
}

test('only an explicit checkbox change updates analytics permission', () => {
	const h = choiceHarness();
	h.control('input').props.onChange({ currentTarget: { checked: true } });
	assert.equal(api.readAcquisitionConsent(h.runtime).analytics_storage, 'granted');
	h.control('input').props.onChange({ currentTarget: { checked: false } });
	assert.equal(api.readAcquisitionContext(h.runtime).visitor_id, undefined);
	assert.equal(api.readAcquisitionConsent(h.runtime).analytics_storage, 'denied');
	assert.equal(h.navigations.length, 0);
});

function payload(cookies) {
	const value = cookies.at(-1).split(';')[0].split('=')[1];
	return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}
test('official root/www Cookie shares a bounded UTF-8 visitor snapshot for console OAuth', () => {
	const { runtime, cookies } = browser();
	granted(runtime);
	runtime.href = 'https://www.sealos.run/downloads?utm_source=搜索&utm_campaign=推广';
	const context = api.readAcquisitionContext(runtime);
	const cookie = cookies.at(-1);
	assert.match(cookie, /^sealos_acquisition_v1=[A-Za-z0-9_-]+;/);
	assert.match(cookie, /Domain=sealos.run; Path=\/; Secure; SameSite=Lax; Max-Age=2592000/);
	const saved = payload(cookies);
	assert.equal(saved.realm, 'china');
	assert.equal(saved.visitor_id, context.visitor_id);
	assert.equal(saved.source.source, '搜索');
	assert.equal(saved.platform_ids.ga_client_id, '12345.67890');
	assert.equal('user_id' in saved, false);
	const { runtime: other, cookies: more } = browser();
	granted(other);
	other.cookie = cookie.split(';')[0];
	other.href = 'https://sealos.run/';
	other.randomId = () => {
		throw new Error('must reuse existing shared visitor');
	};
	assert.equal(api.readAcquisitionContext(other).visitor_id, context.visitor_id);
	assert.equal(payload(more).source.source, '搜索');
});
test('tenant, lookalike, insecure and development hosts cannot write shared Cookie', () => {
	for (const host of [
		'https://hzh.sealos.run',
		'https://tenant.sealos.run',
		'https://sealos.run.attacker.test',
		'http://sealos.run',
		'https://sealos.run:3000',
	]) {
		const { runtime, cookies } = browser();
		runtime.href = host;
		granted(runtime);
		api.readAcquisitionContext(runtime);
		assert.equal(cookies.length, 0, host);
	}
});
test('withdrawal clears shared Cookie, new identity and source without retaining aliases', () => {
	const { runtime, cookies, values } = browser();
	granted(runtime);
	api.readAcquisitionContext(runtime);
	api.setAcquisitionAnalyticsConsent(runtime, false);
	assert.match(cookies.at(-1), /^sealos_acquisition_v1=;.*Max-Age=0$/);
	assert.equal(values.has('sealos_acquisition_visitor_v1'), false);
	assert.equal(values.has('sealos_acquisition_source_v1'), false);
});
test('oversized raw attribution is omitted without mutation and first touch stays within Cookie budget', () => {
	const { runtime, cookies } = browser();
	granted(runtime);
	runtime.consentUpdates.push([
		'consent',
		'update',
		{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
	]);
	const raw = encode({ version: 3, first_touch: { source: 'google', campaign: '中'.repeat(2000) } });
	runtime.rawAttribution = () => raw;
	api.readAcquisitionContext(runtime);
	assert.equal(payload(cookies).sea_attr, undefined);
	assert.ok(Buffer.byteLength(JSON.stringify(payload(cookies))) <= 1800);
	assert.equal(runtime.rawAttribution(), raw);
	runtime.href = 'https://sealos.run/next?utm_source=later';
	assert.equal(api.readAcquisitionContext(runtime).source.source, 'campaign');
});
test('campaign PII and URL secrets are omitted from the shared snapshot', () => {
	for (const campaign of ['someone@example.com', '13800138000', 'https://attacker.test/token', 'secret%0Avalue']) {
		const { runtime, cookies } = browser();
		granted(runtime);
		runtime.href = `https://sealos.run/downloads?utm_campaign=${campaign}&token=secret#private`;
		runtime.referrer = 'https://user:password@example.com/path?secret=true';
		api.readAcquisitionContext(runtime);
		const saved = payload(cookies);
		assert.equal(saved.source.campaign, undefined);
		assert.equal(saved.source.referrer, undefined);
		assert.equal(saved.source.landing_page, 'https://sealos.run/downloads');
	}
});
test('Cookie blocked storage cannot create an identity or affect downloads', () => {
	const { runtime, cookies } = browser();
	granted(runtime);
	runtime.storage.setItem = () => {
		throw new Error('blocked');
	};
	assert.equal(api.readAcquisitionContext(runtime).visitor_id, undefined);
	assert.equal(cookies.length, 0);
});

test('unknown permission does not erase an existing root-domain journey before a www choice', () => {
	const { runtime, cookies } = browser();
	runtime.href = 'https://www.sealos.run/downloads';
	api.readAcquisitionContext(runtime);
	assert.equal(cookies.length, 0);
});

// Exercise the installed observer: consent and SDK readiness can arrive in either order.
const observerSource = await readFile('libs/components/AcquisitionObserver.tsx', 'utf8');
function observerHarness() {
	const { runtime, cookies } = browser();
	const target = new EventTarget();
	const document = new EventTarget();
	const calls = [];
	let identified;
	let cleanup;
	const react = {
		useRef: (current) => ({ current }),
		useEffect: (effect) => {
			cleanup = effect();
		},
	};
	const exports = {};
	const componentCode = ts.transpileModule(observerSource, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
	}).outputText;
	class Anchor {
		closest() {
			return this;
		}
	}
	vm.runInNewContext(componentCode, {
		exports,
		require: (name) =>
			name === 'react'
				? react
				: {
						...api,
						createBrowserAcquisitionRuntime: () => runtime,
						subscribeAcquisitionConsent: (listener) => {
							target.addEventListener('sealos_consent_update', listener);
							return () => target.removeEventListener('sealos_consent_update', listener);
						},
					},
		window: target,
		document,
		Element: Anchor,
	});
	exports.AcquisitionObserver();
	return {
		runtime,
		cookies,
		calls,
		consent: (allowed) => {
			api.setAcquisitionAnalyticsConsent(runtime, allowed);
			target.dispatchEvent(new Event('sealos_consent_update'));
		},
		ready: () => {
			target.rybbit = {
				identify: (id) => {
					identified = id;
					calls.push({ name: 'identify', id });
				},
				getUserId: () => identified || null,
				clearUserId: () => {
					identified = undefined;
					calls.push({ name: 'clearUserId' });
				},
				event: (name, properties) => calls.push({ name, properties }),
			};
			target.dispatchEvent(new Event('sealos:analytics-ready'));
		},
		download: () =>
			document.dispatchEvent(Object.defineProperty(new Event('click'), 'target', { value: new Anchor() })),
		cleanup: () => cleanup(),
	};
}
test('consented visit and direct download queue until the existing Rybbit SDK is ready', () => {
	const h = observerHarness();
	h.consent(true);
	h.download();
	assert.equal(h.calls.length, 0);
	h.ready();
	assert.deepEqual(
		h.calls.map((entry) => entry.name),
		['identify', 'acquisition_visit', 'download_click'],
	);
	const saved = payload(h.cookies);
	assert.equal(h.calls[0].id, saved.visitor_id);
	assert.equal(h.calls[2].properties.visitor_id, saved.visitor_id);
	assert.equal(h.calls[2].properties.surface, 'website');
	assert.equal(h.calls[2].properties.source, 'campaign');
	h.cleanup();
});
test('revocation before SDK readiness discards both queued visit and download events', () => {
	const h = observerHarness();
	h.consent(true);
	h.download();
	h.consent(false);
	h.ready();
	h.download();
	assert.equal(h.calls.length, 0);
	assert.match(h.cookies.at(-1), /Max-Age=0$/);
	h.cleanup();
});

test('sea_attr at 512 characters is retained exactly; next valid Base64URL length above 512 is omitted', () => {
	for (const size of [512, 514]) {
		const { runtime, cookies } = browser();
		granted(runtime);
		runtime.consentUpdates.push([
			'consent',
			'update',
			{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
		]);
		let value;
		for (let length = 1; length < 600; length++) {
			const raw = encode({ version: 3, padding: 'a'.repeat(length) });
			if (raw.length === size) {
				value = raw;
				break;
			}
		}
		assert.equal(value.length, size);
		runtime.rawAttribution = () => value;
		api.readAcquisitionContext(runtime);
		assert.equal(payload(cookies).sea_attr, size === 512 ? value : undefined);
	}
});
test('advertising personalization denial omits even otherwise allowed raw attribution', () => {
	const { runtime, cookies } = browser();
	granted(runtime);
	runtime.consentUpdates.push([
		'consent',
		'update',
		{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' },
	]);
	runtime.rawAttribution = () => encode({ version: 3, first_touch: { source: 'google' } });
	api.readAcquisitionContext(runtime);
	assert.equal(payload(cookies).sea_attr, undefined);
});
test('Rybbit aliases share the backend 128 character limit', () => {
	for (const length of [128, 129]) {
		const { runtime, cookies } = browser();
		granted(runtime);
		runtime.rybbitUserId = () => 'a'.repeat(length);
		api.readAcquisitionContext(runtime);
		assert.equal(payload(cookies).platform_ids.rybbit_user_id, length === 128 ? 'a'.repeat(length) : undefined);
	}
});

test('withdrawal after Rybbit identify clears the SDK persistent identity and stops subsequent events', () => {
	const h = observerHarness();
	h.consent(true);
	h.ready();
	h.consent(false);
	h.download();
	assert.deepEqual(
		h.calls.map((entry) => entry.name),
		['identify', 'acquisition_visit', 'clearUserId'],
	);
	assert.match(h.cookies.at(-1), /Max-Age=0$/);
	h.cleanup();
});
