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

/**
 * The visitor's address as the ingress reports it. `x-real-ip` is set by the
 * ingress itself; the first `x-forwarded-for` entry is the fallback.
 */
export function clientIp(headers: { get(name: string): string | null }): string | null {
	const real = headers.get('x-real-ip')?.trim();
	if (real) return real;
	return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
}
