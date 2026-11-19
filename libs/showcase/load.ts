import 'server-only';
import React from 'react';
import { publicBucketUrl, readCatalog } from './catalog';
import { getShowcasePool } from './db';
import type { ShowcaseProject } from './project';
import type { VoteSnapshot } from './ranking';
import { getVoteCounts, getVotingClock, liveVoteQueries } from './votes';

/** Metadata and page rendering share this read within one request. */
export const loadProjects = React.cache(async (): Promise<ShowcaseProject[] | null> => {
	const base = publicBucketUrl();
	if (!base) return null;
	try {
		return await readCatalog(base);
	} catch (error) {
		console.error('[showcase] failed to read published catalog', error);
		return null;
	}
});

/** Voting is enabled only when the write credentials and live counts are available. */
export async function loadVoting(voterId: string | null, authConfigured: boolean): Promise<VoteSnapshot | null> {
	const pool = getShowcasePool();
	if (!pool) return null;
	try {
		const db = liveVoteQueries(pool);
		const [counts, clock] = await Promise.all([getVoteCounts(db), getVotingClock(db, voterId)]);
		return {
			counts,
			day: clock.day,
			nextResetInMs: clock.nextResetInMs,
			account: !authConfigured ? 'unavailable' : !voterId ? 'anonymous' : clock.spent ? 'spent' : 'ready',
			votedProjectId: clock.projectId,
		};
	} catch (error) {
		console.error('[showcase] failed to load live votes', error);
		return null;
	}
}
