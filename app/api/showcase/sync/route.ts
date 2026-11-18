import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { runSync } from '@/libs/showcase/sync';

const digest = (text: string) => createHash('sha256').update(text).digest();

/**
 * Pull listed projects from Feishu. Called every five minutes by a cron job:
 *   curl -X POST -H "Authorization: Bearer $SHOWCASE_SYNC_SECRET" https://<host>/api/showcase/sync
 * Add `?force=1` to go ahead with a run the takedown guard refused.
 */
export async function POST(request: Request) {
	const secret = process.env['SHOWCASE_SYNC_SECRET'];
	if (!secret) {
		return NextResponse.json({ status: 'unconfigured', missing: ['SHOWCASE_SYNC_SECRET'] }, { status: 503 });
	}
	const given = request.headers.get('authorization') ?? '';
	if (!timingSafeEqual(digest(given), digest(`Bearer ${secret}`))) {
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
	}

	const result = await runSync({ force: new URL(request.url).searchParams.get('force') === '1' });
	const status = { ok: 200, busy: 409, blocked: 409, failed: 502, unconfigured: 503 }[result.status];
	return NextResponse.json(result, { status });
}
