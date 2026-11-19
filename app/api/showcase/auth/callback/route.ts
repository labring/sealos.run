import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
	accountFromTrustedTokenResponse,
	createSession,
	LOGIN_COOKIE,
	parseAuthConfig,
	readLoginAttempt,
	SESSION_COOKIE,
} from '@/libs/showcase/auth';

export async function GET(request: Request) {
	const config = parseAuthConfig(process.env);
	if (!config) return new NextResponse('登录暂时不可用，请稍后再试。', { status: 503 });
	const clearAttempt = (response: NextResponse) => {
		response.headers.set('cache-control', 'no-store');
		response.cookies.set(LOGIN_COOKIE, '', {
			httpOnly: true,
			secure: config.secure,
			sameSite: 'lax',
			path: '/api/showcase/auth',
			maxAge: 0,
		});
		return response;
	};
	const params = new URL(request.url).searchParams;
	const states = params.getAll('state');
	const now = Math.floor(Date.now() / 1000);
	const attempt = readLoginAttempt(
		(await cookies()).get(LOGIN_COOKIE)?.value,
		config.secret,
		states.length === 1 ? (states[0] ?? null) : null,
		now,
	);
	if (!attempt) return clearAttempt(new NextResponse('登录已失效，请返回作品页重新登录。', { status: 400 }));
	const destination = new URL(attempt.returnTo, new URL(config.callback).origin);
	if (params.get('error') === 'access_denied') return clearAttempt(NextResponse.redirect(destination, 303));
	const codes = params.getAll('code');
	if (codes.length !== 1 || !codes[0] || !/^[A-Za-z0-9_-]{1,512}$/.test(codes[0])) {
		return clearAttempt(new NextResponse('登录未完成，请返回作品页重试。', { status: 400 }));
	}
	try {
		const response = await fetch(new URL('/api/auth/oauth2/token', config.origin), {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: config.clientId,
				redirect_uri: config.callback,
				code: codes[0],
				code_verifier: attempt.verifier,
			}),
			cache: 'no-store',
			redirect: 'error',
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) throw new Error('Sealos token exchange failed');
		const account = accountFromTrustedTokenResponse(
			await response.json(),
			config.clientId,
			Math.floor(Date.now() / 1000),
		);
		if (!account) throw new Error('Invalid Sealos token response');
		const issuedAt = Math.floor(Date.now() / 1000);
		const result = NextResponse.redirect(destination, 303);
		result.cookies.set(SESSION_COOKIE, createSession(config.secret, account.uid, account.expiresAt, issuedAt), {
			httpOnly: true,
			secure: config.secure,
			sameSite: 'lax',
			path: '/',
			maxAge: Math.min(account.expiresAt - issuedAt, 3600),
		});
		return clearAttempt(result);
	} catch {
		return clearAttempt(new NextResponse('登录暂时不可用，请返回作品页稍后重试。', { status: 503 }));
	}
}
