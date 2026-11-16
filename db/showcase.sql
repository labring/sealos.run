-- Votes for the Vibe Coding showcase (/showcase).
-- Apply once per database: psql "$SHOWCASE_DATABASE_URL" -f db/showcase.sql
create table if not exists showcase_votes (
	project_id text not null,
	voter_id uuid not null,
	created_at timestamptz not null default now(),
	primary key (project_id, voter_id)
);
