import 'server-only';
import { getShowcasePool } from './db';
import type { ShowcaseProject } from './project';
import type { VoteCounts } from './ranking';
import { listVisibleProjects } from './store';
import { getVoteCounts, getVotedProjectIds } from './votes';

export type Board = { projects: ShowcaseProject[]; counts: VoteCounts };

const TTL_MS = 10_000;
const cache = globalThis as typeof globalThis & { showcaseBoard?: { board: Board; loadedAt: number } };

/**
 * Listed projects and their vote counts, read at most once every ten seconds
 * per process. Returns null when the database is not configured or has never
 * been reachable; after a failed refresh the last good board is served.
 */
export async function loadBoard(): Promise<Board | null> {
	const cached = cache.showcaseBoard;
	if (cached && Date.now() - cached.loadedAt < TTL_MS) {
		return cached.board;
	}
	const pool = getShowcasePool();
	if (!pool) {
		return null;
	}
	try {
		const [projects, counts] = await Promise.all([listVisibleProjects(pool), getVoteCounts(pool)]);
		cache.showcaseBoard = { board: { projects, counts }, loadedAt: Date.now() };
		return cache.showcaseBoard.board;
	} catch (error) {
		console.error('[showcase] failed to load the board', error);
		return cached?.board ?? null;
	}
}

/** Drop the cached board so the next read sees a vote or a sync at once. */
export function invalidateBoard(): void {
	cache.showcaseBoard = undefined;
}

/** Projects this visitor has voted for; empty when unknown or unavailable. */
export async function loadVoted(voterId: string | null): Promise<string[]> {
	const pool = getShowcasePool();
	if (!pool || !voterId) {
		return [];
	}
	try {
		return await getVotedProjectIds(pool, voterId);
	} catch (error) {
		console.error('[showcase] failed to load votes', error);
		return [];
	}
}
