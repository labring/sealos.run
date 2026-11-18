import type { ShowcaseHighlight, ShowcaseProject } from './project.ts';
import type { Queryable } from './votes.ts';

/** Listed projects in tie-break order: higher sort weight first, then earlier listing. */
export async function listVisibleProjects(db: Queryable): Promise<ShowcaseProject[]> {
	const { rows } = await db.query(
		`select id, name, summary, url, cover_url, author, role, prompt, highlights
		from showcase_projects
		where hidden_at is null
		order by sort_weight desc, listed_at, id`,
	);
	return rows.map((row) => ({
		id: String(row['id']),
		name: String(row['name']),
		summary: String(row['summary']),
		url: String(row['url']),
		coverUrl: String(row['cover_url']),
		author: String(row['author']),
		role: String(row['role']),
		prompt: String(row['prompt']),
		highlights: row['highlights'] as ShowcaseHighlight[],
	}));
}

export type StoredProject = { id: string; coverToken: string; coverUrl: string; hidden: boolean };

export async function listStoredProjects(db: Queryable): Promise<StoredProject[]> {
	const { rows } = await db.query(
		'select id, cover_token, cover_url, hidden_at is not null as hidden from showcase_projects',
	);
	return rows.map((row) => ({
		id: String(row['id']),
		coverToken: String(row['cover_token']),
		coverUrl: String(row['cover_url']),
		hidden: Boolean(row['hidden']),
	}));
}

export type ProjectUpsert = Omit<ShowcaseProject, 'coverUrl'> & {
	coverUrl: string;
	coverToken: string;
	sortWeight: number;
};

/** Insert or update a listed project. Listing time is kept from the first listing. */
export async function upsertProject(db: Queryable, project: ProjectUpsert): Promise<void> {
	await db.query(
		`insert into showcase_projects
			(id, name, summary, url, cover_url, cover_token, author, role, prompt, highlights, sort_weight)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
		on conflict (id) do update set
			name = excluded.name, summary = excluded.summary, url = excluded.url,
			cover_url = excluded.cover_url, cover_token = excluded.cover_token,
			author = excluded.author, role = excluded.role, prompt = excluded.prompt,
			highlights = excluded.highlights, sort_weight = excluded.sort_weight,
			hidden_at = null, updated_at = now()`,
		[
			project.id,
			project.name,
			project.summary,
			project.url,
			project.coverUrl,
			project.coverToken,
			project.author,
			project.role,
			project.prompt,
			JSON.stringify(project.highlights),
			project.sortWeight,
		],
	);
}

/** Take projects off the site but keep their rows and votes. */
export async function hideProjects(db: Queryable, ids: readonly string[]): Promise<void> {
	if (ids.length === 0) return;
	await db.query(
		'update showcase_projects set hidden_at = now(), updated_at = now() where id = any($1) and hidden_at is null',
		[ids],
	);
}

/** Remove projects and their votes for good (the Feishu row no longer exists). */
export async function deleteProjects(db: Queryable, ids: readonly string[]): Promise<void> {
	if (ids.length === 0) return;
	await db.query('delete from showcase_votes where project_id = any($1)', [ids]);
	await db.query('delete from showcase_projects where id = any($1)', [ids]);
}

/** Record the current alert and return the previous one, so callers notify only on change. */
export async function swapAlertKey(db: Queryable, key: string): Promise<string> {
	const { rows } = await db.query(
		`with previous as (select alert_key from showcase_sync_state where id),
		written as (
			insert into showcase_sync_state (id, alert_key) values (true, $1)
			on conflict (id) do update set alert_key = excluded.alert_key, updated_at = now()
		)
		select coalesce((select alert_key from previous), 'ok') as previous`,
		[key],
	);
	return String(rows[0]?.['previous'] ?? 'ok');
}
