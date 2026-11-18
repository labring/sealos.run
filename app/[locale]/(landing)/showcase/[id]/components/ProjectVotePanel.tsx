'use client';

import React from 'react';
import { Button } from '@/libs/components/ui/button';
import type { Standing } from '@/libs/showcase/board';
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
	standing: Standing;
	/** Whether this visitor has already voted for the project. */
	voted: boolean;
};

export function ProjectVotePanel({ projectId, standing, voted: votedBefore }: ProjectVotePanelProps) {
	const { snapshot, pendingId, failedId, vote } = useVotes({
		counts: { [projectId]: standing.votes },
		voted: votedBefore ? [projectId] : [],
	});
	const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

	const votes = snapshot?.counts[projectId] ?? standing.votes;
	const voted = snapshot?.voted.includes(projectId) ?? false;

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
			<div className='flex items-baseline justify-between gap-4'>
				<p>
					<span className='text-5xl font-semibold tabular-nums'>{votes}</span>
					<span className='text-muted-foreground ml-2'>票</span>
				</p>
				<span className='text-muted-foreground text-sm'>NO.{standing.rank}</span>
			</div>
			<p className='text-muted-foreground mt-3 text-sm'>{describeStanding(standing)}</p>

			<Button
				className='mt-6 h-11 w-full first:mt-0 disabled:opacity-100'
				variant={voted || !snapshot ? 'secondary' : 'default'}
				disabled={!snapshot || voted || pendingId !== null}
				onClick={() => vote(projectId)}
			>
				{!snapshot ? '点赞暂时不可用，请稍后再来' : voted ? '已为它点赞' : '为它点赞'}
			</Button>
			{failedId === projectId && (
				<output className='text-destructive mt-2 block text-sm'>没点成功，请再试一次</output>
			)}

			<div className='mt-6 border-t pt-6'>
				<p className='font-medium'>邀请朋友来点赞</p>
				<p className='text-muted-foreground mt-1 text-sm'>
					复制链接发到群聊或朋友圈，朋友打开就能给这个作品点赞。
				</p>
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
