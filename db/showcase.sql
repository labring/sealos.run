-- Vibe Coding showcase (/showcase): listed projects, votes, sync alert state.
-- Safe to re-run: psql "$SHOWCASE_DATABASE_URL" -f db/showcase.sql

-- Public fields of listed projects, mirrored from the Feishu Base by /api/showcase/sync.
-- `id` is the Feishu record id. Feishu stays the source of truth.
create table if not exists showcase_projects (
	id text primary key,
	name text not null,
	summary text not null,
	url text not null,
	cover_url text not null,
	-- Feishu file token of the cover the stored image was made from.
	cover_token text not null,
	author text not null,
	role text not null default '',
	prompt text not null default '',
	highlights jsonb not null default '[]',
	sort_weight integer not null default 0,
	listed_at timestamptz not null default now(),
	-- Set while the row is unticked in Feishu. Votes are kept.
	hidden_at timestamptz,
	updated_at timestamptz not null default now()
);

create table if not exists showcase_votes (
	project_id text not null,
	voter_id uuid not null,
	created_at timestamptz not null default now(),
	primary key (project_id, voter_id)
);
-- Keyed hash of the voter's IP (never the raw address), for the per-IP cap and clean-up.
alter table showcase_votes add column if not exists ip_hash text;
alter table showcase_votes add column if not exists user_agent text;
create index if not exists showcase_votes_ip_idx on showcase_votes (project_id, ip_hash);
create index if not exists showcase_votes_voter_idx on showcase_votes (voter_id);

-- One row: the last alert sent, so a repeated failure is reported once.
create table if not exists showcase_sync_state (
	id boolean primary key default true check (id),
	alert_key text not null default 'ok',
	updated_at timestamptz not null default now()
);
