export const VOTER_COOKIE = 'showcase_voter';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function parseVoteRequest(body: unknown, knownIds: readonly string[]): { projectId: string } | null {
	if (!body || typeof body !== 'object' || !('projectId' in body)) {
		return null;
	}
	const { projectId } = body;
	if (typeof projectId !== 'string' || !knownIds.includes(projectId)) {
		return null;
	}
	return { projectId };
}

/** The voter cookie is client-controlled: only a well-formed UUID may reach the database. */
export function parseVoterId(raw: string | undefined): string | null {
	const value = raw?.toLowerCase();
	return value && UUID_PATTERN.test(value) ? value : null;
}
