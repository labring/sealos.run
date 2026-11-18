import type { VoteCounts } from './ranking.ts';

/** The slice of pg's Pool / Client these queries need. */
export type Queryable = {
	query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

/** Votes one IP may give one project: room for a shared office or campus address. */
export const IP_VOTE_CAP = 5;

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

export type VoteInput = { projectId: string; voterId: string; ipHash: string | null; userAgent: string | null };
export type VoteResult =
	| { status: 'unknown_project' }
	/** `voted` is false when the IP has used up its votes for this project. */
	| { status: 'ok'; voted: boolean; votes: number };

/**
 * One vote per visitor per listed project; a repeat vote is a no-op. An IP
 * that already gave the project IP_VOTE_CAP votes cannot add another.
 */
export async function castVote(
	db: Queryable,
	{ projectId, voterId, ipHash, userAgent }: VoteInput,
): Promise<VoteResult> {
	const { rows } = await db.query(
		`with project as (
			select 1 from showcase_projects where id = $1 and hidden_at is null
		), inserted as (
			insert into showcase_votes (project_id, voter_id, ip_hash, user_agent)
			select $1, $2::uuid, $3, $4
			where exists (select 1 from project)
				and ($3::text is null
					or (select count(*) from showcase_votes where project_id = $1 and ip_hash = $3) < $5)
			on conflict do nothing
			returning 1
		)
		select
			exists (select 1 from project) as known,
			exists (select 1 from inserted)
				or exists (select 1 from showcase_votes where project_id = $1 and voter_id = $2::uuid) as voted,
			((select count(*) from showcase_votes where project_id = $1) + (select count(*) from inserted))::int as votes`,
		[projectId, voterId, ipHash, userAgent?.slice(0, 300) ?? null, IP_VOTE_CAP],
	);
	const row = rows[0];
	if (!row?.['known']) {
		return { status: 'unknown_project' };
	}
	return { status: 'ok', voted: Boolean(row['voted']), votes: Number(row['votes']) };
}
