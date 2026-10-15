import { consoleInvitePreviewUrl } from './invite.config';

export type InvitePreviewStatus = 'valid' | 'not_found' | 'disabled' | 'unavailable' | 'unknown';

export type InvitePreview = {
	status: InvitePreviewStatus;
	inviterNickname: string | null;
};

type PreviewResponse = {
	code?: number;
	data?: {
		valid?: boolean;
		reason?: 'not_found' | 'disabled' | 'unavailable';
		inviterNickname?: string;
	};
};

/**
 * Fetch masked inviter info for the landing page. The preview endpoint is
 * read-only (unlike the console's invite/accept which persists the invite
 * context), so it is safe to call from the marketing site. Any failure is
 * reported as 'unknown' and the page simply renders without inviter details.
 */
export async function getInvitePreview(code: string): Promise<InvitePreview> {
	try {
		const response = await fetch(consoleInvitePreviewUrl(code), {
			// Masked nicknames change rarely; keep a short server-side cache.
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(3000),
		});
		if (!response.ok) {
			return { status: 'unknown', inviterNickname: null };
		}
		const payload = (await response.json()) as PreviewResponse;
		if (payload.code !== 200 || !payload.data) {
			return { status: 'unknown', inviterNickname: null };
		}
		if (payload.data.valid) {
			return { status: 'valid', inviterNickname: payload.data.inviterNickname ?? null };
		}
		return { status: payload.data.reason ?? 'not_found', inviterNickname: null };
	} catch {
		return { status: 'unknown', inviterNickname: null };
	}
}
