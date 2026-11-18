import { createHmac } from 'node:crypto';

export const VOTER_COOKIE = 'showcase_voter';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** Feishu record ids are short alphanumeric strings; the database decides whether one is listed. */
const PROJECT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function parseVoteRequest(body: unknown): { projectId: string } | null {
	if (!body || typeof body !== 'object' || !('projectId' in body)) {
		return null;
	}
	const { projectId } = body;
	if (typeof projectId !== 'string' || !PROJECT_ID_PATTERN.test(projectId)) {
		return null;
	}
	return { projectId };
}

/** The voter cookie is client-controlled: only a well-formed UUID may reach the database. */
export function parseVoterId(raw: string | undefined): string | null {
	const value = raw?.toLowerCase();
	return value && UUID_PATTERN.test(value) ? value : null;
}

/**
 * The visitor's address as the ingress reports it. `x-real-ip` is set by the
 * ingress itself; the first `x-forwarded-for` entry is the fallback.
 */
export function clientIp(headers: { get(name: string): string | null }): string | null {
	const real = headers.get('x-real-ip')?.trim();
	if (real) return real;
	return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
}

/** Keyed hash, so stored votes cannot be mapped back to an address without the salt. */
export function hashIp(ip: string, salt: string): string {
	return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32);
}
