import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getShowcasePool } from '@/libs/showcase/db';
import { invalidateBoard } from '@/libs/showcase/load';
import { createRateLimiter } from '@/libs/showcase/rate-limit';
import { clientIp, hashIp, parseVoteRequest, parseVoterId, VOTER_COOKIE } from '@/libs/showcase/vote-request';
import { castVote } from '@/libs/showcase/votes';

// Voting is anonymous by design: votes only decide the on-site ranking, never a
// cash reward. Abuse is limited, not prevented: a request limit per IP, a cap on
// votes one IP can give one project, and a hashed IP on every vote for clean-up.

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const allowRequest = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request) {
	const ip = clientIp(request.headers);
	if (ip && !allowRequest(ip)) {
		return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	}
	const vote = parseVoteRequest(body);
	if (!vote) {
		return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	}

	const pool = getShowcasePool();
	if (!pool) {
		return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	}

	const cookieStore = await cookies();
	const voterId = parseVoterId(cookieStore.get(VOTER_COOKIE)?.value) ?? crypto.randomUUID();
	const salt = process.env['SHOWCASE_SYNC_SECRET'] || 'showcase';

	let result: Awaited<ReturnType<typeof castVote>>;
	try {
		result = await castVote(pool, {
			projectId: vote.projectId,
			voterId,
			ipHash: ip ? hashIp(ip, salt) : null,
			userAgent: request.headers.get('user-agent'),
		});
	} catch (error) {
		console.error('[showcase] failed to record vote', error);
		return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	}
	if (result.status === 'unknown_project') {
		return NextResponse.json({ error: 'not_found' }, { status: 404 });
	}
	if (!result.voted) {
		return NextResponse.json({ error: 'ip_limit' }, { status: 429 });
	}
	invalidateBoard();

	const response = NextResponse.json({ projectId: vote.projectId, votes: result.votes });
	response.cookies.set(VOTER_COOKIE, voterId, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: ONE_YEAR_SECONDS,
	});
	return response;
}
