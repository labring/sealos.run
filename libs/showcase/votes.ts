import type { ClientBase, Pool } from 'pg';
import type { VoteCounts } from './ranking.ts';

export type Queryable = {
	query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

/** Live reads have their own deadline; synchronization and vote writes keep their transaction behavior. */
export function liveVoteQueries(pool: Pool): Queryable {
	return {
		query: (text, values) => {
			// pg supports this per-query option, although its QueryConfig type omits it.
			const config = { text, values, query_timeout: 3000 };
			return pool.query(config);
		},
	};
}

export async function getVoteCounts(db: Queryable): Promise<VoteCounts> {
	const { rows } = await db.query(
		'select project_id, count(*)::int as votes from showcase_account_votes where project_id is not null group by project_id',
	);
	return Object.fromEntries(rows.map((row) => [String(row['project_id']), Number(row['votes'])]));
}

/** Today's allowance remains spent even if its project has been deleted. */
export async function getDailyVote(
	db: Queryable,
	voterId: string,
): Promise<{ spent: boolean; projectId: string | null }> {
	const { rows } = await db.query(
		`select project_id from showcase_account_votes
		where account_uid = $1::uuid and vote_date = (clock_timestamp() at time zone 'Asia/Shanghai')::date`,
		[voterId],
	);
	const row = rows[0];
	return { spent: Boolean(row), projectId: row?.['project_id'] == null ? null : String(row['project_id']) };
}

/** Day, next reset, and account allowance come from one database clock reading. */
export async function getVotingClock(
	db: Queryable,
	voterId: string | null,
): Promise<{ day: string; nextResetInMs: number; spent: boolean; projectId: string | null }> {
	const { rows } = await db.query(
		`with beijing as materialized (select clock_timestamp() at time zone 'Asia/Shanghai' as current_time)
		select to_char(beijing.current_time::date, 'YYYY-MM-DD') as day,
			ceil(extract(epoch from ((beijing.current_time::date + 1)::timestamp - beijing.current_time)) * 1000)::int as next_reset_in_ms,
			vote.account_uid is not null as spent, vote.project_id
		from beijing left join showcase_account_votes vote
			on vote.account_uid = $1::uuid and vote.vote_date = beijing.current_time::date`,
		[voterId],
	);
	const row = rows[0];
	if (
		typeof row?.['day'] !== 'string' ||
		typeof row['next_reset_in_ms'] !== 'number' ||
		typeof row['spent'] !== 'boolean'
	) {
		throw new Error('Missing voting clock');
	}
	return {
		day: row['day'],
		nextResetInMs: row['next_reset_in_ms'],
		spent: row['spent'],
		projectId: row['project_id'] == null ? null : String(row['project_id']),
	};
}

/** `voterId` must come from a verified Sealos account, never from the request body. */
export type VoteInput = { projectId: string; voterId: string };
export type VoteResult =
	| { status: 'unknown_project' }
	| { status: 'daily_limit'; projectId: string | null }
	| { status: 'ok'; voted: true; votes: number };

/** The project lock serializes voting with hiding or deleting that project. */
export async function castVote(db: ClientBase, { projectId, voterId }: VoteInput): Promise<VoteResult> {
	await db.query('begin');
	try {
		const project = await db.query(
			'select id from showcase_projects where id = $1 and hidden_at is null for update',
			[projectId],
		);
		if (!project.rowCount) {
			await db.query('commit');
			return { status: 'unknown_project' };
		}
		const day = await db.query<{ date: string }>(
			"select to_char((clock_timestamp() at time zone 'Asia/Shanghai')::date, 'YYYY-MM-DD') as date",
		);
		const voteDate = day.rows[0]?.date;
		if (!voteDate) throw new Error('Missing voting date');
		const inserted = await db.query(
			`insert into showcase_account_votes (account_uid, vote_date, project_id)
			values ($1::uuid, $2::date, $3)
			on conflict (account_uid, vote_date) do nothing returning project_id`,
			[voterId, voteDate, projectId],
		);
		if (!inserted.rowCount) {
			const existing = await db.query<{ project_id: string | null }>(
				'select project_id from showcase_account_votes where account_uid = $1::uuid and vote_date = $2::date',
				[voterId, voteDate],
			);
			if (!existing.rows[0]) throw new Error('Missing daily vote');
			await db.query('commit');
			return { status: 'daily_limit', projectId: existing.rows[0].project_id };
		}
		const { rows } = await db.query<{ votes: number }>(
			'select count(*)::int as votes from showcase_account_votes where project_id = $1',
			[projectId],
		);
		const votes = rows[0]?.votes;
		if (votes === undefined) throw new Error('Missing vote count');
		await db.query('commit');
		return { status: 'ok', voted: true, votes };
	} catch (error) {
		await db.query('rollback');
		throw error;
	}
}
