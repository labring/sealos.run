import React from 'react';
import { useRouter } from '@/libs/i18n/navigation';
import type { VoteSnapshot } from '@/libs/showcase/ranking';

export type VoteFailure = { message: string; blocked: boolean };
type OwnVote = { day: string; projectId: string | null; votes?: number };

/** The server is authoritative; optimistic state is scoped to the same activity day. */
export function useVotes(serverSnapshot: VoteSnapshot | null) {
	const router = useRouter();
	const [own, setOwn] = React.useState<OwnVote | null>(null);
	const [pendingId, setPendingId] = React.useState<string | null>(null);
	const [failures, setFailures] = React.useState<Partial<Record<string, VoteFailure>>>({});
	const activeOwn =
		own && serverSnapshot && own.day === serverSnapshot.day && serverSnapshot.account === 'ready' ? own : null;
	const snapshot: VoteSnapshot | null = serverSnapshot && {
		...serverSnapshot,
		counts:
			activeOwn?.projectId && activeOwn.votes !== undefined
				? {
						...serverSnapshot.counts,
						[activeOwn.projectId]: Math.max(
							activeOwn.votes,
							serverSnapshot.counts[activeOwn.projectId] ?? 0,
						),
					}
				: serverSnapshot.counts,
		account: activeOwn ? 'spent' : serverSnapshot.account,
		votedProjectId: activeOwn ? activeOwn.projectId : serverSnapshot.votedProjectId,
	};

	React.useEffect(() => {
		if (serverSnapshot?.account === 'spent' || serverSnapshot?.account === 'anonymous') setOwn(null);
	}, [serverSnapshot?.account]);

	React.useEffect(() => {
		if (!serverSnapshot) return;
		const timer = window.setTimeout(() => {
			setOwn(null);
			setFailures({});
			router.refresh();
		}, serverSnapshot.nextResetInMs + 250);
		const refreshOnReturn = () => {
			if (document.visibilityState === 'visible') router.refresh();
		};
		document.addEventListener('visibilitychange', refreshOnReturn);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('visibilitychange', refreshOnReturn);
		};
	}, [router, serverSnapshot]);

	const vote = async (projectId: string) => {
		if (!snapshot || pendingId || snapshot.account === 'spent' || snapshot.account === 'unavailable') return;
		const login = () => {
			const returnTo = `${window.location.pathname}${window.location.search}`;
			window.location.assign(`/api/showcase/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
		};
		if (snapshot.account === 'anonymous') {
			login();
			return;
		}
		setPendingId(projectId);
		setFailures((current) => ({ ...current, [projectId]: undefined }));
		try {
			const response = await fetch('/api/showcase/votes', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ projectId }),
			});
			if (response.status === 401) {
				login();
				return;
			}
			if (response.status === 409) {
				const result: { projectId?: unknown } = await response.json();
				setOwn({
					day: snapshot.day,
					projectId: typeof result.projectId === 'string' ? result.projectId : null,
				});
				router.refresh();
				return;
			}
			if (response.status === 429) {
				setFailures((current) => ({
					...current,
					[projectId]: { message: '操作太频繁，请稍后再试', blocked: false },
				}));
				return;
			}
			if (!response.ok) {
				if (response.status === 503 || response.status === 404) router.refresh();
				throw new Error(`vote request failed: ${response.status}`);
			}
			const result: { projectId: string; votes: number } = await response.json();
			setOwn({ day: snapshot.day, projectId: result.projectId, votes: result.votes });
			router.refresh();
		} catch (error) {
			console.error('[showcase] vote failed', error);
			setFailures((current) => ({
				...current,
				[projectId]: { message: '投票没成功，请再试一次', blocked: false },
			}));
		} finally {
			setPendingId(null);
		}
	};

	return { snapshot, pendingId, failures, vote };
}
