import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { showcaseProjectIds } from '@/app/[locale]/(landing)/showcase/utils/showcase.config';
import { getShowcasePool } from '@/libs/showcase/db';
import { parseVoteRequest, parseVoterId, VOTER_COOKIE } from '@/libs/showcase/vote-request';
import { castVote, readVoteSnapshot } from '@/libs/showcase/votes';

// TODO(待确认): 目前是匿名点赞，用 Cookie 里的随机访客 ID 去重（每个访客每个作品 1 票）。
// 清除 Cookie 或用脚本直接请求即可重复投票，没有登录校验与限流。
// 是否改为「登录 Sealos 账号限赞 1 次」待产品确认；改造时 voter_id 换成账号 ID 即可沿用现有表。

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	}
	const vote = parseVoteRequest(body, showcaseProjectIds);
	if (!vote) {
		return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
	}

	const pool = getShowcasePool();
	if (!pool) {
		return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	}

	const cookieStore = await cookies();
	const voterId = parseVoterId(cookieStore.get(VOTER_COOKIE)?.value) ?? crypto.randomUUID();

	let snapshot: Awaited<ReturnType<typeof readVoteSnapshot>>;
	try {
		await castVote(pool, vote.projectId, voterId);
		snapshot = await readVoteSnapshot(pool, voterId);
	} catch (error) {
		console.error('[showcase] failed to record vote', error);
		return NextResponse.json({ error: 'unavailable' }, { status: 503 });
	}

	const response = NextResponse.json(snapshot);
	response.cookies.set(VOTER_COOKIE, voterId, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: ONE_YEAR_SECONDS,
	});
	return response;
}
