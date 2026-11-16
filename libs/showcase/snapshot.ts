import 'server-only';
import { getShowcasePool } from './db';
import type { VoteSnapshot } from './ranking';
import { readVoteSnapshot } from './votes';

/**
 * Votes for the showcase page. Returns null when the vote database is not
 * configured or unreachable: the page then renders projects without vote
 * counts or a podium instead of failing (degradation confirmed with the owner).
 */
export async function loadVoteSnapshot(voterId: string | null): Promise<VoteSnapshot | null> {
	const pool = getShowcasePool();
	if (!pool) {
		return null;
	}
	try {
		return await readVoteSnapshot(pool, voterId);
	} catch (error) {
		console.error('[showcase] failed to load votes', error);
		return null;
	}
}
