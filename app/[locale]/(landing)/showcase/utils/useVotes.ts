import React from 'react';
import { useRouter } from '@/libs/i18n/navigation';
import type { VoteSnapshot } from '@/libs/showcase/ranking';

/**
 * Vote state shared by the showcase list and the project page.
 * `snapshot` is null when votes are unavailable, in which case voting is off.
 *
 * The server's snapshot can be a few seconds old, so this visitor's own votes
 * are kept on top of it: a count never drops below what the vote returned.
 */
export function useVotes(serverSnapshot: VoteSnapshot | null) {
	const router = useRouter();
	const [own, setOwn] = React.useState<Record<string, number>>({});
	const [pendingId, setPendingId] = React.useState<string | null>(null);
	const [failedId, setFailedId] = React.useState<string | null>(null);

	const snapshot: VoteSnapshot | null = serverSnapshot && {
		counts: Object.fromEntries(
			Object.entries({ ...serverSnapshot.counts, ...own }).map(([id, votes]) => [
				id,
				Math.max(votes, serverSnapshot.counts[id] ?? 0),
			]),
		),
		voted: [...new Set([...serverSnapshot.voted, ...Object.keys(own)])],
	};

	const vote = async (projectId: string) => {
		if (!snapshot || pendingId) return;
		setPendingId(projectId);
		setFailedId(null);
		try {
			const response = await fetch('/api/showcase/votes', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ projectId }),
			});
			if (!response.ok) {
				throw new Error(`vote request failed: ${response.status}`);
			}
			const result: { projectId: string; votes: number } = await response.json();
			setOwn((current) => ({ ...current, [result.projectId]: result.votes }));
			// Re-rank on the server; scroll position and search stay as they are.
			router.refresh();
		} catch (error) {
			console.error('[showcase] vote failed', error);
			setFailedId(projectId);
		} finally {
			setPendingId(null);
		}
	};

	return { snapshot, pendingId, failedId, vote };
}
