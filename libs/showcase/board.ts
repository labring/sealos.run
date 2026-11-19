import { searchProjects } from './filters.ts';
import { paginate } from './pagination.ts';
import { PODIUM_SIZE, podiumGap, type Ranked, rankProjects, type VoteCounts } from './ranking.ts';

/** A project needs at least this many votes to stand on the podium. */
export const PODIUM_MIN_VOTES = 1;

type Listed = { id: string; name: string; author: string };

export type BoardPage<T> = {
	/** Up to three leaders with at least one vote; empty on a fresh board. */
	podium: Array<Ranked<T> & { gap: number | null }>;
	/** One page of the remaining projects that match the query. */
	rows: Array<T & { rank: number | null; votes: number | null; toPodium: number | null }>;
	page: number;
	pageCount: number;
	matchCount: number;
	/** Podium projects that match the query. */
	featuredMatches: number;
	/** Votes a project must reach to get on the podium. */
	podiumThreshold: number | null;
};

/** Split ranked projects into the podium and everything else. */
export function splitPodium<T extends { votes: number }>(ranked: readonly T[]): { podium: T[]; rest: T[] } {
	const podium = ranked.slice(0, PODIUM_SIZE).filter((project) => project.votes >= PODIUM_MIN_VOTES);
	return { podium, rest: ranked.slice(podium.length) };
}

/** Votes needed to get on the podium: pass third place, or the minimum while a place is free. */
export function podiumThreshold(podium: readonly { votes: number }[]): number {
	const third = podium[PODIUM_SIZE - 1];
	return third ? third.votes + 1 : PODIUM_MIN_VOTES;
}

/**
 * The slice of the board one request shows. `projects` must already be in
 * tie-break order (sort weight, then listing time): equal votes keep it.
 */
export function buildBoardPage<T extends Listed>(
	projects: readonly T[],
	counts: VoteCounts | null,
	{ page, query, pageSize }: { page: number; query: string; pageSize: number },
): BoardPage<T> {
	if (counts === null) {
		const matches = searchProjects(projects, query);
		const result = paginate(matches, page, pageSize);
		return {
			podium: [],
			rows: result.items.map((project) => ({ ...project, votes: null, rank: null, toPodium: null })),
			page: result.page,
			pageCount: result.pageCount,
			matchCount: matches.length,
			featuredMatches: 0,
			podiumThreshold: null,
		};
	}
	const { podium, rest } = splitPodium(rankProjects(projects, counts));
	const threshold = podiumThreshold(podium);
	const matches = searchProjects(rest, query);
	const rows = paginate(matches, page, pageSize);
	return {
		podium: podium.map((project) => ({ ...project, gap: podiumGap(podium, project.rank) })),
		rows: rows.items.map((project) => ({
			...project,
			rank: project.votes > 0 ? project.rank : null,
			toPodium: threshold - project.votes,
		})),
		page: rows.page,
		pageCount: rows.pageCount,
		matchCount: matches.length,
		featuredMatches: searchProjects(podium, query).length,
		podiumThreshold: threshold,
	};
}

export type Standing = {
	rank: number | null;
	votes: number;
	onPodium: boolean;
	/** Leader only: lead over second place. */
	lead: number | null;
	/** On the podium but not first: votes needed to pass the leader. */
	toLeader: number | null;
	/** Off the podium: votes needed to get on it. */
	toPodium: number | null;
};

/** Where one project stands, for its own page. Null if it is not listed. */
export function standingOf(
	projects: readonly { id: string }[],
	counts: VoteCounts | null,
	id: string,
): Standing | null {
	if (counts === null) return null;
	const ranked = rankProjects(projects, counts);
	const project = ranked.find((item) => item.id === id);
	if (!project) return null;
	const { podium } = splitPodium(ranked);
	const onPodium = project.rank <= podium.length;
	const leader = ranked[0];
	return {
		rank: project.votes > 0 ? project.rank : null,
		votes: project.votes,
		onPodium,
		lead: project.rank === 1 ? podiumGap(podium, 1) : null,
		toLeader: onPodium && project.rank > 1 && leader ? leader.votes - project.votes + 1 : null,
		toPodium: onPodium ? null : podiumThreshold(podium) - project.votes,
	};
}
