import { NextResponse } from 'next/server';
import { createLoginAttempt, LOGIN_COOKIE, parseAuthConfig, safeReturnPath } from '@/libs/showcase/auth';

export async function GET(request: Request) {
	const config = parseAuthConfig(process.env);
	if (!config) return new NextResponse('登录暂时不可用，请稍后再试。', { status: 503 });
	const params = new URL(request.url).searchParams;
	const returnTo = params.getAll('returnTo');
	const target = returnTo.length === 1 ? safeReturnPath(returnTo[0] ?? null) : null;
	if (!target) return new NextResponse('登录地址无效。', { status: 400 });
	const attempt = createLoginAttempt(config.secret, target, Math.floor(Date.now() / 1000));
	const authorize = new URL('/api/auth/oauth2/code/authorize', config.origin);
	authorize.search = new URLSearchParams({
		response_type: 'code',
		client_id: config.clientId,
		redirect_uri: config.callback,
		state: attempt.state,
		code_challenge: attempt.challenge,
		code_challenge_method: 'S256',
	}).toString();
	const response = NextResponse.redirect(authorize, 302);
	response.headers.set('cache-control', 'no-store');
	response.cookies.set(LOGIN_COOKIE, attempt.cookie, {
		httpOnly: true,
		secure: config.secure,
		sameSite: 'lax',
		path: '/api/showcase/auth',
		maxAge: 600,
	});
	return response;
}
