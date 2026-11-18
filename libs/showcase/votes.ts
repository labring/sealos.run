import type { VoteCounts, VoteSnapshot } from './ranking.ts';

/** The slice of pg's Pool / Client these queries need. */
export type Queryable = {
	query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

export async function getVoteCounts(db: Queryable): Promise<VoteCounts> {
	const { rows } = await db.query(
		'select project_id, count(*)::int as votes from showcase_votes group by project_id',
	);
	const counts: VoteCounts = {};
	for (const row of rows) {
		counts[String(row['project_id'])] = Number(row['votes']);
	}
	return counts;
}

export async function getVotedProjectIds(db: Queryable, voterId: string): Promise<string[]> {
	const { rows } = await db.query('select project_id from showcase_votes where voter_id = $1', [voterId]);
	return rows.map((row) => String(row['project_id']));
}

/** One vote per visitor per project: a repeat vote is a no-op. */
export async function castVote(db: Queryable, projectId: string, voterId: string): Promise<void> {
	await db.query('insert into showcase_votes (project_id, voter_id) values ($1, $2) on conflict do nothing', [
		projectId,
		voterId,
	]);
}

export async function readVoteSnapshot(db: Queryable, voterId: string | null): Promise<VoteSnapshot> {
	const [counts, voted] = await Promise.all([getVoteCounts(db), voterId ? getVotedProjectIds(db, voterId) : []]);
	return { counts, voted };
}
