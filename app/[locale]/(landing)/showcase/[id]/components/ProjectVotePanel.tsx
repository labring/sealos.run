'use client';

import React from 'react';
import { Button } from '@/libs/components/ui/button';
import type { Standing } from '@/libs/showcase/board';
import type { VoteSnapshot } from '@/libs/showcase/ranking';
import { useVotes } from '../../utils/useVotes';

function describeStanding({ rank, lead, toLeader, toPodium }: Standing): string {
	if (toPodium !== null) {
		return `再得 ${toPodium} 票进入前三`;
	}
	if (rank === 1) {
		return lead ? `目前排名第一，领先第 2 名 ${lead} 票` : '目前排名第一';
	}
	return toLeader === null ? '' : `已进入前三，距第一名还差 ${toLeader} 票`;
}

type ProjectVotePanelProps = {
	projectId: string;
	/** Rank and votes as the server last saw them. */
	standing: Standing | null;
	/** The account's daily voting allowance. */
	voting: VoteSnapshot | null;
};

export function ProjectVotePanel({ projectId, standing, voting }: ProjectVotePanelProps) {
	const { snapshot, pendingId, failures, vote } = useVotes(voting);
	const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

	const votes = snapshot?.counts[projectId] ?? standing?.votes;
	const spent = snapshot?.account === 'spent';
	const voted = spent && snapshot.votedProjectId === projectId;
	const unavailable = !snapshot || snapshot.account === 'unavailable';
	const failure = failures[projectId];

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}`);
			setCopyState('copied');
		} catch {
			setCopyState('failed');
		}
	};

	return (
		<aside className='bg-card rounded-2xl border p-6'>
			{standing && (
				<>
					<div className='flex items-baseline justify-between gap-4'>
						<p>
							<span className='text-5xl font-semibold tabular-nums'>{votes}</span>
							<span className='text-muted-foreground ml-2'>票</span>
						</p>
						{standing.rank !== null && (
							<span className='text-muted-foreground text-sm'>NO.{standing.rank}</span>
						)}
					</div>
					<p className='text-muted-foreground mt-3 text-sm'>{describeStanding(standing)}</p>
				</>
			)}

			<Button
				className='mt-6 h-11 w-full first:mt-0 disabled:opacity-100'
				variant={spent || unavailable || failure?.blocked ? 'secondary' : 'default'}
				disabled={unavailable || spent || pendingId !== null || failure?.blocked}
				onClick={() => vote(projectId)}
			>
				{unavailable
					? '投票暂时不可用'
					: voted
						? '今天已为它投票'
						: spent
							? '今天的票已投出'
							: snapshot.account === 'anonymous'
								? '登录后投票'
								: '为它投票'}
			</Button>
			{snapshot && <p className='text-muted-foreground mt-2 text-sm'>每个账号每天一票，北京时间 0 点更新。</p>}
			{snapshot && failure && <output className='text-destructive mt-2 block text-sm'>{failure.message}</output>}

			<div className='mt-6 border-t pt-6'>
				<p className='font-medium'>{unavailable ? '分享作品' : '邀请朋友来投票'}</p>
				{!unavailable && (
					<p className='text-muted-foreground mt-1 text-sm'>复制链接发给朋友，登录后就能为这个作品投票。</p>
				)}
				<Button
					variant='outline'
					className='mt-4 h-11 w-full'
					onClick={copyLink}
				>
					{copyState === 'copied'
						? '已复制作品链接'
						: copyState === 'failed'
							? '复制失败，请复制地址栏链接'
							: '复制作品链接'}
				</Button>
			</div>
		</aside>
	);
}
