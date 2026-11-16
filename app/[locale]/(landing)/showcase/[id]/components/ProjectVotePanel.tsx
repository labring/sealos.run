'use client';

import React from 'react';
import { Button } from '@/libs/components/ui/button';
import { PODIUM_SIZE, type Ranked, rankProjects, type VoteSnapshot } from '@/libs/showcase/ranking';
import { type ShowcaseProject, showcaseProjects } from '../../utils/showcase.config';
import { useVotes } from '../../utils/useVotes';

function describeStanding(ranked: readonly Ranked<ShowcaseProject>[], project: Ranked<ShowcaseProject>): string {
	const leader = ranked[0];
	const third = ranked[PODIUM_SIZE - 1];
	if (project.rank > PODIUM_SIZE && third) {
		return `再得 ${third.votes - project.votes + 1} 赞进入前三`;
	}
	if (project.rank === 1) {
		const lead = project.votes - (ranked[1]?.votes ?? 0);
		return lead > 0 ? `目前排名第一，领先第 2 名 ${lead} 赞` : '目前排名第一';
	}
	return leader ? `已进入前三，距第一名还差 ${leader.votes - project.votes + 1} 赞` : '';
}

type ProjectVotePanelProps = {
	projectId: string;
	/** Null when votes are unavailable. */
	initialSnapshot: VoteSnapshot | null;
};

export function ProjectVotePanel({ projectId, initialSnapshot }: ProjectVotePanelProps) {
	const { snapshot, pendingId, failedId, vote } = useVotes(initialSnapshot);
	const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

	const ranked = snapshot ? rankProjects(showcaseProjects, snapshot.counts) : null;
	const project = ranked?.find((item) => item.id === projectId);
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
			{ranked && project && (
				<>
					<div className='flex items-baseline justify-between gap-4'>
						<p>
							<span className='text-5xl font-semibold tabular-nums'>{project.votes}</span>
							<span className='text-muted-foreground ml-2'>赞</span>
						</p>
						<span className='text-muted-foreground text-sm'>NO.{project.rank}</span>
					</div>
					<p className='text-muted-foreground mt-3 text-sm'>{describeStanding(ranked, project)}</p>
				</>
			)}

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
