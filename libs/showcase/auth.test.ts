import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import * as auth from './auth.ts';

test('login return paths stay within the showcase', () => {
	assert.equal(typeof auth.safeReturnPath, 'function');
	assert.equal(auth.safeReturnPath('/showcase/rec123?page=2'), '/showcase/rec123?page=2');
	assert.equal(auth.safeReturnPath('/zh/showcase?q=a'), '/zh/showcase?q=a');
	for (const invalid of [
		null,
		'',
		'https://evil.example/',
		'//evil.example/',
		'/\\evil.example/',
		'/other',
		'/showcase/../api',
		'/showcase#fragment',
		'/showcase\n',
	]) {
		assert.equal(auth.safeReturnPath(invalid), null);
	}
});

test('OAuth configuration rejects insecure or incomplete deployment settings', () => {
	assert.equal(typeof auth.parseAuthConfig, 'function');
	const env = {
		SHOWCASE_AUTH_ORIGIN: 'https://bja.sealos.run',
		SHOWCASE_AUTH_CLIENT_ID: 'showcase',
		SHOWCASE_AUTH_CALLBACK_URL: 'https://sealos.run/api/showcase/auth/callback',
		SHOWCASE_AUTH_SECRET: 'a-strong-secret-at-least-32-characters',
		NODE_ENV: 'production',
	};
	assert.ok(auth.parseAuthConfig(env));
	assert.equal(auth.parseAuthConfig({ ...env, SHOWCASE_AUTH_SECRET: 'short' }), null);
	assert.equal(auth.parseAuthConfig({ ...env, SHOWCASE_AUTH_CLIENT_ID: '' }), null);
	assert.equal(auth.parseAuthConfig({ ...env, SHOWCASE_AUTH_ORIGIN: 'http://bja.sealos.run' }), null);
	assert.equal(auth.parseAuthConfig({ ...env, SHOWCASE_AUTH_CALLBACK_URL: 'https://sealos.run/another' }), null);
	assert.equal(
		auth.parseAuthConfig({
			...env,
			SHOWCASE_AUTH_CALLBACK_URL: 'https://user:pass@sealos.run/api/showcase/auth/callback',
		}),
		null,
	);
});

test('login attempts bind state and PKCE to a signed, expiring cookie', () => {
	assert.equal(typeof auth.createLoginAttempt, 'function');
	const secret = 'a-strong-secret-at-least-32-characters';
	const attempt = auth.createLoginAttempt(secret, '/showcase/rec123', 1_000);
	const decoded = auth.readLoginAttempt(attempt.cookie, secret, attempt.state, 1_001);
	assert.ok(decoded);
	assert.equal(decoded.returnTo, '/showcase/rec123');
	assert.match(decoded.verifier, /^[A-Za-z0-9_-]{43,128}$/);
	assert.equal(attempt.challenge, createHash('sha256').update(decoded.verifier).digest('base64url'));
	assert.equal(auth.readLoginAttempt(attempt.cookie, secret, 'wrong-state', 1_001), null);
	assert.equal(auth.readLoginAttempt(`${attempt.cookie}x`, secret, attempt.state, 1_001), null);
	assert.equal(auth.readLoginAttempt(attempt.cookie, secret, attempt.state, 1_601), null);
});

test('signed sessions reject altered, expired and unrelated cookies', () => {
	assert.equal(typeof auth.createSession, 'function');
	const secret = 'a-strong-secret-at-least-32-characters';
	const uid = 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643';
	const cookie = auth.createSession(secret, uid, 2_000, 1_000);
	assert.equal(auth.readSession(cookie, secret, 1_001), uid);
	assert.equal(auth.readSession(`${cookie}x`, secret, 1_001), null);
	assert.equal(auth.readSession(cookie, `${secret}x`, 1_001), null);
	assert.equal(auth.readSession(cookie, secret, 2_000), null);
	const attempt = auth.createLoginAttempt(secret, '/showcase', 1_000);
	assert.equal(auth.readSession(attempt.cookie, secret, 1_001), null);
});

test('trusted Sealos token response must contain the expected client, account and expiry', () => {
	assert.equal(typeof auth.accountFromTrustedTokenResponse, 'function');
	const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
	const uid = 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643';
	const token = (claims: Record<string, unknown>) =>
		`${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.signature`;
	const claims = { sub: uid, client_id: 'website-client', token_type: 'access_token', exp: 2_000 };
	const response = (payload: Record<string, unknown>) => ({ token_type: 'Bearer', access_token: token(payload) });
	assert.deepEqual(auth.accountFromTrustedTokenResponse(response(claims), 'website-client', 1_000), {
		uid,
		expiresAt: 2_000,
	});
	for (const invalid of [
		response({ ...claims, sub: 'not-an-account' }),
		response({ ...claims, client_id: 'other' }),
		response({ ...claims, token_type: 'refresh_token' }),
		response({ ...claims, exp: 999 }),
		{ token_type: 'Bearer', access_token: 'not-a-token' },
	]) {
		assert.equal(auth.accountFromTrustedTokenResponse(invalid, 'website-client', 1_000), null);
	}
});
