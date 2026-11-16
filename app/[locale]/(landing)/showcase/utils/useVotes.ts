import React from 'react';
import type { VoteSnapshot } from '@/libs/showcase/ranking';

/**
 * Vote state shared by the showcase list and the project page.
 * `snapshot` is null when votes are unavailable, in which case voting is off.
 */
export function useVotes(initialSnapshot: VoteSnapshot | null) {
	const [snapshot, setSnapshot] = React.useState(initialSnapshot);
	const [pendingId, setPendingId] = React.useState<string | null>(null);
	const [failedId, setFailedId] = React.useState<string | null>(null);

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
			const next: VoteSnapshot = await response.json();
			setSnapshot(next);
		} catch (error) {
			console.error('[showcase] vote failed', error);
			setFailedId(projectId);
		} finally {
			setPendingId(null);
		}
	};

	return { snapshot, pendingId, failedId, vote };
}
