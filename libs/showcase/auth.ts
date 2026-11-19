import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const LOGIN_COOKIE = 'showcase_login';
export const SESSION_COOKIE = 'showcase_session';

export type AuthConfig = { origin: string; clientId: string; callback: string; secret: string; secure: boolean };

export function parseAuthConfig(env: Record<string, string | undefined>): AuthConfig | null {
	const { SHOWCASE_AUTH_ORIGIN, SHOWCASE_AUTH_CLIENT_ID, SHOWCASE_AUTH_CALLBACK_URL, SHOWCASE_AUTH_SECRET } = env;
	if (
		!SHOWCASE_AUTH_ORIGIN ||
		!SHOWCASE_AUTH_CLIENT_ID?.trim() ||
		!SHOWCASE_AUTH_CALLBACK_URL ||
		!SHOWCASE_AUTH_SECRET
	) {
		return null;
	}
	if (Buffer.byteLength(SHOWCASE_AUTH_SECRET) < 32) return null;
	try {
		const origin = new URL(SHOWCASE_AUTH_ORIGIN);
		const callback = new URL(SHOWCASE_AUTH_CALLBACK_URL);
		const validTransport = (url: URL) =>
			url.protocol === 'https:' ||
			(env['NODE_ENV'] !== 'production' &&
				url.protocol === 'http:' &&
				['127.0.0.1', '[::1]'].includes(url.hostname));
		if (
			!validTransport(origin) ||
			!validTransport(callback) ||
			origin.username ||
			origin.password ||
			origin.pathname !== '/' ||
			origin.search ||
			origin.hash ||
			callback.username ||
			callback.password ||
			callback.pathname !== '/api/showcase/auth/callback' ||
			callback.search ||
			callback.hash
		) {
			return null;
		}
		return {
			origin: origin.origin,
			clientId: SHOWCASE_AUTH_CLIENT_ID.trim(),
			callback: callback.href,
			secret: SHOWCASE_AUTH_SECRET,
			secure: callback.protocol === 'https:',
		};
	} catch {
		return null;
	}
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BASE64URL = /^[A-Za-z0-9_-]+$/;
const attemptSchema = z.object({
	state: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
	verifier: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
	returnTo: z.string(),
	exp: z.number().int(),
});
const sessionSchema = z.object({ uid: z.string().regex(UUID), exp: z.number().int() });

function sign(secret: string, purpose: string, value: unknown): string {
	if (Buffer.byteLength(secret) < 32) throw new Error('Showcase session secret must have at least 32 bytes');
	const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
	const signature = createHmac('sha256', secret).update(`${purpose}:${payload}`).digest('base64url');
	return `${payload}.${signature}`;
}

function verify(secret: string, purpose: string, cookie: string | undefined): unknown {
	if (Buffer.byteLength(secret) < 32 || !cookie || cookie.length > 4096) return null;
	const parts = cookie.split('.');
	if (parts.length !== 2) return null;
	const [payload, signature] = parts;
	if (!payload || !signature || !BASE64URL.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
	const actual = Buffer.from(signature);
	const expected = Buffer.from(createHmac('sha256', secret).update(`${purpose}:${payload}`).digest('base64url'));
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
	try {
		return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
	} catch {
		return null;
	}
}

export function safeReturnPath(input: string | null): string | null {
	if (
		!input ||
		input.length > 2048 ||
		!input.startsWith('/') ||
		input.startsWith('//') ||
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Return paths must reject control characters.
		/[\\\u0000-\u001f\u007f]/.test(input)
	) {
		return null;
	}
	const url = new URL(input, 'https://showcase.invalid');
	if (url.origin !== 'https://showcase.invalid' || url.hash || !/^\/(?:zh\/)?showcase(?:\/|$)/.test(url.pathname)) {
		return null;
	}
	return `${url.pathname}${url.search}`;
}

export function createLoginAttempt(secret: string, returnTo: string, now: number) {
	const target = safeReturnPath(returnTo);
	if (!target) throw new Error('Invalid showcase return path');
	const state = randomBytes(32).toString('base64url');
	const verifier = randomBytes(32).toString('base64url');
	return {
		state,
		challenge: createHash('sha256').update(verifier).digest('base64url'),
		cookie: sign(secret, 'attempt', { state, verifier, returnTo: target, exp: now + 600 }),
	};
}

export function readLoginAttempt(cookie: string | undefined, secret: string, state: string | null, now: number) {
	const result = attemptSchema.safeParse(verify(secret, 'attempt', cookie));
	if (!result.success || result.data.exp <= now || result.data.state !== state) return null;
	if (safeReturnPath(result.data.returnTo) !== result.data.returnTo) return null;
	return result.data;
}

export function createSession(secret: string, uid: string, expiresAt: number, now: number): string {
	if (!UUID.test(uid) || !Number.isInteger(expiresAt) || expiresAt <= now) throw new Error('Invalid account session');
	return sign(secret, 'session', { uid: uid.toLowerCase(), exp: Math.min(expiresAt, now + 3600) });
}

export function readSession(cookie: string | undefined, secret: string, now: number): string | null {
	const result = sessionSchema.safeParse(verify(secret, 'session', cookie));
	return result.success && result.data.exp > now ? result.data.uid.toLowerCase() : null;
}

/** Only use with a direct, no-redirect HTTPS response from the configured Sealos token endpoint. */
export function accountFromTrustedTokenResponse(
	body: unknown,
	clientId: string,
	now: number,
): { uid: string; expiresAt: number } | null {
	const response = z.object({ token_type: z.literal('Bearer'), access_token: z.string().max(8192) }).safeParse(body);
	if (!response.success) return null;
	const parts = response.data.access_token.split('.');
	if (parts.length !== 3 || parts.some((part) => !part || !BASE64URL.test(part))) return null;
	try {
		const header: unknown = JSON.parse(Buffer.from(parts[0] ?? '', 'base64url').toString('utf8'));
		const payload: unknown = JSON.parse(Buffer.from(parts[1] ?? '', 'base64url').toString('utf8'));
		if (!z.object({ alg: z.literal('HS256') }).safeParse(header).success) return null;
		const claims = z
			.object({
				sub: z.string().regex(UUID),
				client_id: z.literal(clientId),
				token_type: z.literal('access_token'),
				exp: z.number().int(),
			})
			.safeParse(payload);
		return claims.success && claims.data.exp > now
			? { uid: claims.data.sub.toLowerCase(), expiresAt: claims.data.exp }
			: null;
	} catch {
		return null;
	}
}
