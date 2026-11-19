import type { ShowcaseHighlight, ShowcaseProject } from './project.ts';
import type { Queryable } from './votes.ts';

export type StoredImage = { token: string; url: string };

/** Listed projects in tie-break order. Only these fields enter the public catalog. */
export async function listVisibleProjects(db: Queryable): Promise<ShowcaseProject[]> {
	const { rows } = await db.query(
		`select id, name, summary, url, social_links, cover_url, author, role, prompt, highlights, gallery
		from showcase_projects where hidden_at is null order by sort_weight desc, listed_at, id`,
	);
	return rows.map((row) => ({
		id: String(row['id']),
		name: String(row['name']),
		summary: String(row['summary']),
		url: String(row['url']),
		socialLinks: row['social_links'] as string[],
		coverUrl: String(row['cover_url']),
		imageUrls: (row['gallery'] as StoredImage[]).map((image) => image.url),
		author: String(row['author']),
		role: String(row['role']),
		prompt: String(row['prompt']),
		highlights: row['highlights'] as ShowcaseHighlight[],
	}));
}

export type StoredProject = { id: string; images: StoredImage[]; hidden: boolean };

export async function listStoredProjects(db: Queryable): Promise<StoredProject[]> {
	const { rows } = await db.query(
		'select id, cover_token, cover_url, gallery, hidden_at is not null as hidden from showcase_projects',
	);
	return rows.map((row) => ({
		id: String(row['id']),
		images: [
			{ token: String(row['cover_token']), url: String(row['cover_url']) },
			...(row['gallery'] as StoredImage[]),
		],
		hidden: Boolean(row['hidden']),
	}));
}

export type ProjectUpsert = Omit<ShowcaseProject, 'imageUrls' | 'socialLinks'> & {
	socialLinks: string[];
	coverToken: string;
	gallery: StoredImage[];
	sortWeight: number;
};

/** Listing time is kept from the first listing. */
export async function upsertProject(db: Queryable, project: ProjectUpsert): Promise<void> {
	await db.query(
		`insert into showcase_projects
			(id, name, summary, url, cover_url, cover_token, author, role, prompt, highlights, sort_weight, gallery, social_links)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, $13::jsonb)
		on conflict (id) do update set
			name = excluded.name, summary = excluded.summary, url = excluded.url,
			cover_url = excluded.cover_url, cover_token = excluded.cover_token, gallery = excluded.gallery,
			author = excluded.author, role = excluded.role, prompt = excluded.prompt,
			highlights = excluded.highlights, sort_weight = excluded.sort_weight, social_links = excluded.social_links,
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
			JSON.stringify(project.gallery),
			JSON.stringify(project.socialLinks),
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

/** The caller holds a transaction. Lock projects before votes to serialize with castVote. */
export async function deleteProjects(db: Queryable, ids: readonly string[]): Promise<void> {
	if (ids.length === 0) return;
	await db.query('select id from showcase_projects where id = any($1) order by id for update', [ids]);
	await db.query('delete from showcase_votes where project_id = any($1)', [ids]);
	await db.query('delete from showcase_projects where id = any($1)', [ids]);
}

export async function lastDeliveredAlert(db: Queryable): Promise<string> {
	const { rows } = await db.query('select alert_key from showcase_sync_state where id');
	return String(rows[0]?.['alert_key'] ?? 'ok');
}

export async function recordDeliveredAlert(db: Queryable, key: string): Promise<void> {
	await db.query(
		`insert into showcase_sync_state (id, alert_key) values (true, $1)
		on conflict (id) do update set alert_key = excluded.alert_key, updated_at = now()`,
		[key],
	);
}
