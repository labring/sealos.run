import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { PoolClient } from 'pg';
import { parseAuthConfig, readSession, SESSION_COOKIE } from '@/libs/showcase/auth';
import { getShowcasePool } from '@/libs/showcase/db';
import { createRateLimiter } from '@/libs/showcase/rate-limit';
import { clientIp, parseVoteRequest } from '@/libs/showcase/vote-request';
import { castVote } from '@/libs/showcase/votes';

const allowRequest = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request) {
	const config = parseAuthConfig(process.env);
	const pool = getShowcasePool();
	if (!config || !pool) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	if (request.headers.get('origin') !== new URL(config.callback).origin) {
		return NextResponse.json({ error: 'invalid_origin' }, { status: 403 });
	}
	const voterId = readSession(
		(await cookies()).get(SESSION_COOKIE)?.value,
		config.secret,
		Math.floor(Date.now() / 1000),
	);
	if (!voterId) return NextResponse.json({ error: 'login_required' }, { status: 401 });
	const ip = clientIp(request.headers);
	if (!ip) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	if (!allowRequest(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	}
	const vote = parseVoteRequest(body);
	if (!vote) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	let db: PoolClient | undefined;
	try {
		db = await pool.connect();
		const result = await castVote(db, { projectId: vote.projectId, voterId });
		if (result.status === 'unknown_project') return NextResponse.json({ error: 'not_found' }, { status: 404 });
		if (result.status === 'daily_limit') {
			return NextResponse.json({ error: 'daily_limit', projectId: result.projectId }, { status: 409 });
		}
		return NextResponse.json({ projectId: vote.projectId, votes: result.votes });
	} catch (error) {
		console.error('[showcase] failed to record vote', error);
		db?.release(true);
		db = undefined;
		return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	} finally {
		db?.release();
	}
}
