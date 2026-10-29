export type ConsentValue = 'granted' | 'denied' | 'unspecified';
export type AcquisitionConsent = Record<
	'analytics_storage' | 'ad_storage' | 'ad_user_data' | 'ad_personalization',
	ConsentValue
>;
export type AcquisitionSource = {
	source: string;
	medium?: string;
	campaign?: string;
	landing_page: string;
	referrer?: string;
	timestamp: string;
};
export type AcquisitionContext = {
	version: 1;
	visitor_id?: string;
	sea_attr?: string;
	source?: AcquisitionSource;
	activation_source?: AcquisitionSource;
	last_source?: AcquisitionSource;
	consent: AcquisitionConsent;
	platform_ids?: { ga_client_id?: string; rybbit_user_id?: string };
};
export type AcquisitionRuntime = {
	storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
	href: string;
	referrer: string;
	cookie: string;
	consentUpdates: unknown[];
	now: () => Date;
	randomId: () => string;
	rawAttribution?: () => string | undefined;
	rybbitUserId?: () => string | null | undefined;
};
const VISITOR_KEY = 'sealos_acquisition_visitor_v1';
const SOURCE_KEY = 'sealos_acquisition_source_v1';
const CONSENT_KEY = 'sealos_acquisition_consent_v1';
const CONSENT_FIELDS = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'] as const;
export const ACQUISITION_AUTHORITY = 'https://bja.sealos.run';
const CAPABILITY = /^[A-Za-z0-9_.~-]{20,2048}$/;
const ID = /^[A-Za-z0-9_.:-]{1,200}$/;

function readJson(runtime: AcquisitionRuntime, key: string): unknown {
	try {
		return JSON.parse(runtime.storage.getItem(key) || 'null');
	} catch {
		return undefined;
	}
}
function object(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}
type ConsentReadState = {
	cursor: number;
	lastEntry: unknown;
	stored: string | null | undefined;
	consent: AcquisitionConsent;
};
const consentReads = new WeakMap<unknown[], ConsentReadState>();
function storedConsent(runtime: AcquisitionRuntime): string | null | undefined {
	try {
		return runtime.storage.getItem(CONSENT_KEY);
	} catch {
		return undefined;
	}
}
function initialConsent(stored: string | null | undefined): AcquisitionConsent {
	const consent: AcquisitionConsent = {
		analytics_storage: 'unspecified',
		ad_storage: 'unspecified',
		ad_user_data: 'unspecified',
		ad_personalization: 'unspecified',
	};
	try {
		const saved = object(JSON.parse(stored || 'null'));
		if (saved?.['analytics_storage'] === 'granted' || saved?.['analytics_storage'] === 'denied')
			consent.analytics_storage = saved['analytics_storage'];
	} catch {
		/* An invalid stored decision grants nothing. */
	}
	return consent;
}
export function readAcquisitionConsent(runtime: AcquisitionRuntime): AcquisitionConsent {
	const queue = runtime.consentUpdates;
	const stored = storedConsent(runtime);
	let state = consentReads.get(queue);
	let updatesFrom = state?.cursor ?? 0;
	const historyMoved = state && state.cursor > 0 && state.lastEntry !== queue[state.cursor - 1];
	let historyOnly = false;
	if (!state || state.stored !== stored) {
		historyOnly = Boolean(state) || stored != null;
		if (updatesFrom > queue.length) updatesFrom = 0;
		// Persisted choices reset page state; old grants cannot undo a newer withdrawal.
		state = {
			cursor: historyOnly ? queue.length : 0,
			lastEntry: queue.at(-1),
			stored,
			consent: initialConsent(stored),
		};
		consentReads.set(queue, state);
	}
	if (historyMoved || state.cursor > queue.length) {
		// A rotated queue has unknown ordering: historical entries may only tighten permission.
		historyOnly = true;
		updatesFrom = 0;
		state.cursor = queue.length;
		state.lastEntry = queue.at(-1);
	}
	let updated = false;
	for (const value of queue.slice(updatesFrom)) {
		const item: Record<string, unknown> | undefined =
			object(value) || (Array.isArray(value) ? { 0: value[0], 1: value[1], 2: value[2] } : undefined);
		const payload =
			item?.['0'] === 'consent' && item?.['1'] === 'update'
				? object(item?.['2'])
				: item?.['event'] === 'sealos_consent_update'
					? item
					: undefined;
		if (!payload) continue;
		for (const key of CONSENT_FIELDS) {
			const value = payload[key];
			if (value === 'granted' || value === 'denied' || value === 'unspecified') {
				if (historyOnly && value !== 'denied') continue;
				state.consent[key] = value;
				updated = true;
			}
		}
	}
	state.cursor = queue.length;
	state.lastEntry = queue.at(-1);
	if (updated && state.consent.analytics_storage !== 'unspecified') {
		try {
			runtime.storage.setItem(
				CONSENT_KEY,
				JSON.stringify({ analytics_storage: state.consent.analytics_storage }),
			);
		} catch {
			/* A blocked store must not prevent an explicit in-page choice. */
		}
		state.stored = storedConsent(runtime);
	}
	return { ...state.consent };
}
export function setAcquisitionAnalyticsConsent(runtime: AcquisitionRuntime, allowed: boolean): AcquisitionConsent {
	const consent = {
		...readAcquisitionConsent(runtime),
		analytics_storage: allowed ? 'granted' : 'denied',
	} satisfies AcquisitionConsent;
	try {
		runtime.storage.setItem(CONSENT_KEY, JSON.stringify({ analytics_storage: consent.analytics_storage }));
	} catch {
		/* A blocked store must not block the user's action. */
	}
	runtime.consentUpdates.push({
		event: 'sealos_consent_update',
		...Object.fromEntries(Object.entries(consent).filter(([, value]) => value !== 'unspecified')),
	});
	// Consume the local choice now so a later withdrawal cannot replay this grant.
	consentReads.set(runtime.consentUpdates, {
		cursor: runtime.consentUpdates.length,
		lastEntry: runtime.consentUpdates.at(-1),
		stored: storedConsent(runtime),
		consent: { ...consent },
	});
	if (!allowed) clearIdentity(runtime);
	return consent;
}
export function subscribeAcquisitionConsent(listener: () => void): () => void {
	const storage = (event: StorageEvent) => {
		// Ignore source/visitor writes so cross-tab updates cannot cause a read/write loop.
		if (event.key === CONSENT_KEY || event.key === null) listener();
	};
	window.addEventListener('sealos_consent_update', listener);
	window.addEventListener('storage', storage);
	return () => {
		window.removeEventListener('sealos_consent_update', listener);
		window.removeEventListener('storage', storage);
	};
}
function clearIdentity(runtime: AcquisitionRuntime): void {
	try {
		runtime.storage.removeItem(VISITOR_KEY);
		runtime.storage.removeItem(SOURCE_KEY);
	} catch {
		/* Storage may be disabled. */
	}
}
function bounded(value: string | null, max = 200): string | undefined {
	return value && value.length <= max && !Array.from(value).some((character) => character.charCodeAt(0) < 32)
		? value
		: undefined;
}
function publicPage(value: string): string | undefined {
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) ? `${url.origin}${url.pathname}`.slice(0, 500) : undefined;
	} catch {
		return undefined;
	}
}
function captureSource(runtime: AcquisitionRuntime): AcquisitionSource {
	let url = new URL(runtime.href);
	const referrer = publicPage(runtime.referrer);
	// A first-time explicit choice on the continuation page may use the same-
	// origin download page as its landing context, never a credential-bearing query.
	if (url.pathname.replace(/\/$/, '') === '/app-attribution' && referrer && new URL(referrer).origin === url.origin) {
		try {
			url = new URL(runtime.referrer);
		} catch {
			/* Use the current public page. */
		}
	}
	let source = bounded(url.searchParams.get('utm_source'));
	if (
		!source &&
		referrer &&
		new URL(referrer).origin !== url.origin &&
		new URL(referrer).origin !== ACQUISITION_AUTHORITY &&
		url.pathname.replace(/\/$/, '') !== '/app-attribution'
	)
		source = new URL(referrer).hostname;
	return {
		source: source || 'direct',
		medium: bounded(url.searchParams.get('utm_medium')),
		campaign: bounded(url.searchParams.get('utm_campaign')),
		landing_page: publicPage(url.href) || url.origin,
		referrer,
		timestamp: runtime.now().toISOString(),
	};
}
function storedSource(value: unknown): AcquisitionSource | undefined {
	const record = object(value);
	const source = typeof record?.['source'] === 'string' ? bounded(record['source']) : undefined;
	const landingPage = typeof record?.['landing_page'] === 'string' ? publicPage(record['landing_page']) : undefined;
	const timestamp =
		typeof record?.['timestamp'] === 'string' && Number.isFinite(Date.parse(record['timestamp']))
			? record['timestamp']
			: undefined;
	if (!source || !landingPage || !timestamp) return undefined;
	return {
		source,
		landing_page: landingPage,
		timestamp,
		medium: typeof record?.['medium'] === 'string' ? bounded(record['medium']) : undefined,
		campaign: typeof record?.['campaign'] === 'string' ? bounded(record['campaign']) : undefined,
		referrer: typeof record?.['referrer'] === 'string' ? publicPage(record['referrer']) : undefined,
	};
}
function containsAdIdentifier(value: unknown): boolean {
	const record = object(value);
	if (!record) return Array.isArray(value) && value.some(containsAdIdentifier);
	return Object.entries(record).some(
		([key, entry]) =>
			(/^(click_value|click_id_value|hashed_user_data|email_sha256|phone_sha256|gclid|gbraid|wbraid|msclkid|fbclid|ttclid|rdt_cid|li_fat_id|twclid|email|phone|user_data)$/i.test(
				key,
			) &&
				!!entry) ||
			(typeof entry === 'object' && containsAdIdentifier(entry)),
	);
}
function encodedAttribution(runtime: AcquisitionRuntime, consent: AcquisitionConsent): string | undefined {
	try {
		const raw = runtime.rawAttribution?.();
		if (!raw || raw.length > 16384 || !/^[A-Za-z0-9_-]+$/.test(raw)) return undefined;
		const decoded = object(
			JSON.parse(
				new TextDecoder().decode(
					Uint8Array.from(atob(raw.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
				),
			),
		);
		if (!decoded || ![2, 3].includes(Number(decoded['version']))) return undefined;
		// Preserve accepted raw bytes. If they contain disallowed ad identifiers, omit
		// the snapshot rather than silently rewriting a value covered by a hash.
		if ((consent.ad_storage !== 'granted' || consent.ad_user_data !== 'granted') && containsAdIdentifier(decoded))
			return undefined;
		return raw;
	} catch {
		return undefined;
	}
}
export function readAcquisitionContext(runtime: AcquisitionRuntime): AcquisitionContext {
	const consent = readAcquisitionConsent(runtime);
	const context: AcquisitionContext = { version: 1, consent };
	if (consent.analytics_storage !== 'granted') {
		clearIdentity(runtime);
		return context;
	}
	try {
		let visitor = runtime.storage.getItem(VISITOR_KEY);
		if (!visitor || !ID.test(visitor)) {
			visitor = runtime.randomId();
			runtime.storage.setItem(VISITOR_KEY, visitor);
		}
		if (ID.test(visitor)) context.visitor_id = visitor;
		const current = captureSource(runtime);
		const previous = object(readJson(runtime, SOURCE_KEY));
		const source = storedSource(previous?.['first_touch']) || current;
		const bridgePage = new URL(runtime.href).pathname.replace(/\/$/, '') === '/app-attribution';
		const previousLast = storedSource(previous?.['last_touch']);
		// OAuth roundtrips read the existing journey; they are not new campaigns.
		const last = bridgePage && previousLast ? previousLast : current;
		const lastNonDirect = last.source === 'direct' ? storedSource(previous?.['last_non_direct']) : last;
		runtime.storage.setItem(
			SOURCE_KEY,
			JSON.stringify({ version: 1, first_touch: source, last_touch: last, last_non_direct: lastNonDirect }),
		);
		context.source = source;
		context.last_source = last;
		context.activation_source = lastNonDirect || last;
	} catch {
		/* Without durable storage, do not invent a persistent visitor. */
	}
	const seaAttr = encodedAttribution(runtime, consent);
	if (seaAttr) context.sea_attr = seaAttr;
	const ga = runtime.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)(?:;|$)/)?.[1];
	let rybbit: string | null | undefined;
	try {
		rybbit = runtime.rybbitUserId?.();
	} catch {
		/* A late third-party SDK is optional. */
	}
	if (ga || (rybbit && ID.test(rybbit)))
		context.platform_ids = {
			...(ga ? { ga_client_id: ga } : {}),
			...(rybbit && ID.test(rybbit) ? { rybbit_user_id: rybbit } : {}),
		};
	return context;
}
export function getAcquisitionBridgeTarget(
	href: string,
): { handoff: string; endpoint: string; continuation: string } | undefined {
	try {
		const url = new URL(href);
		const authority = new URL(url.searchParams.get('authority') || '');
		const handoff = url.searchParams.get('handoff') || '';
		if (
			authority.href !== `${ACQUISITION_AUTHORITY}/` ||
			authority.origin !== ACQUISITION_AUTHORITY ||
			!CAPABILITY.test(handoff)
		)
			return undefined;
		const endpoint = `${authority.origin}/api/auth/oauth2/code/attribution`;
		return {
			handoff,
			endpoint,
			continuation: `${endpoint}?handoff=${encodeURIComponent(handoff)}`,
		};
	} catch {
		return undefined;
	}
}
export async function completeAcquisitionBridge(
	href: string,
	runtime: AcquisitionRuntime,
	request: typeof fetch = fetch,
): Promise<string> {
	const target = getAcquisitionBridgeTarget(href);
	if (!target) throw new Error('Invalid acquisition handoff');
	try {
		await request(target.endpoint, {
			method: 'POST',
			credentials: 'omit',
			referrerPolicy: 'no-referrer',
			headers: { 'Content-Type': 'application/json' },
			signal: AbortSignal.timeout(5000),
			body: JSON.stringify({
				...readAcquisitionContext(runtime),
				handoff: target.handoff,
			}),
		});
	} catch {
		/* Analytics cannot prevent the original OAuth request from resuming. */
	}
	return target.continuation;
}
export async function issueAcquisitionAppLink(
	runtime: AcquisitionRuntime,
	request: typeof fetch = fetch,
): Promise<string> {
	const response = await request(`${ACQUISITION_AUTHORITY}/api/marketing/acquisition/issue`, {
		method: 'POST',
		credentials: 'omit',
		referrerPolicy: 'no-referrer',
		headers: { 'Content-Type': 'application/json' },
		signal: AbortSignal.timeout(5000),
		body: JSON.stringify(readAcquisitionContext(runtime)),
	});
	if (!response.ok) throw new Error('Unable to create acquisition handoff');
	const result: unknown = await response.json();
	const data = object(result);
	const code = data?.['code'];
	const expiresAt = data?.['expires_at'];
	if (
		typeof code !== 'string' ||
		!CAPABILITY.test(code) ||
		typeof expiresAt !== 'string' ||
		!Number.isFinite(Date.parse(expiresAt)) ||
		Date.parse(expiresAt) <= runtime.now().getTime()
	)
		throw new Error('Invalid acquisition handoff response');
	const url = new URL('zcode://sealos/acquisition');
	url.searchParams.set('code', code);
	url.searchParams.set('authority', ACQUISITION_AUTHORITY);
	return url.toString();
}

export function createBrowserAcquisitionRuntime(): AcquisitionRuntime {
	const runtimeWindow = window as Window & {
		dataLayer?: unknown[];
		__sealosAttribution?: { encode?: () => string | undefined };
		rybbit?: { getUserId?: () => string | null };
	};
	runtimeWindow.dataLayer = runtimeWindow.dataLayer || [];
	return {
		storage: {
			getItem: (key) => window.localStorage.getItem(key),
			setItem: (key, value) => window.localStorage.setItem(key, value),
			removeItem: (key) => window.localStorage.removeItem(key),
		},
		href: window.location.href,
		referrer: document.referrer,
		get cookie() {
			return document.cookie;
		},
		consentUpdates: runtimeWindow.dataLayer,
		now: () => new Date(),
		randomId: () => crypto.randomUUID(),
		rawAttribution: () => {
			const encoded =
				runtimeWindow.__sealosAttribution?.encode?.() ||
				new URL(window.location.href).searchParams.get('sea_attr');
			if (encoded) return encoded;
			const stored = window.localStorage.getItem('sealos_attr_v2');
			if (!stored) return undefined;
			return btoa(Array.from(new TextEncoder().encode(stored), (byte) => String.fromCharCode(byte)).join(''))
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=+$/, '');
		},
		rybbitUserId: () => runtimeWindow.rybbit?.getUserId?.(),
	};
}
