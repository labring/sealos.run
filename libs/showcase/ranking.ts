export type VoteCounts = Record<string, number>;

/** Vote totals plus the projects the current visitor has already voted for. */
export type VoteSnapshot = { counts: VoteCounts; voted: string[] };

export type Ranked<T> = T & { votes: number; rank: number };

export const PODIUM_SIZE = 3;

/**
 * Order projects by votes. Ties keep the configured order, so a fresh board
 * with no votes shows projects exactly as they are listed in the config.
 */
export function rankProjects<T extends { id: string }>(projects: readonly T[], counts: VoteCounts): Ranked<T>[] {
	return projects
		.map((project, index) => ({ project, index, votes: counts[project.id] ?? 0 }))
		.sort((a, b) => b.votes - a.votes || a.index - b.index)
		.map(({ project, votes }, position) => ({ ...project, votes, rank: position + 1 }));
}

/** Votes a project still needs to overtake third place; null once it is on the podium. */
export function votesToPodium(
	ranked: readonly { id: string; votes: number; rank: number }[],
	id: string,
): number | null {
	const project = ranked.find((item) => item.id === id);
	const third = ranked[PODIUM_SIZE - 1];
	if (!project || !third || project.rank <= PODIUM_SIZE) {
		return null;
	}
	return third.votes - project.votes + 1;
}
