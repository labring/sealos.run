'use client';

import React from 'react';
import { cn } from '@/libs/utils/styling';
import { type BountyTrack, bountyTiers, bountyTracks } from '../utils/showcase.config';

export function BountySection() {
	const [track, setTrack] = React.useState<BountyTrack>('deep');

	return (
		<section
			id='bounty'
			className='scroll-mt-16 py-20 sm:py-28'
		>
			<div className='container mx-auto px-6'>
				<div className='text-center'>
					<h2 className='text-3xl font-semibold sm:text-5xl'>纯现金创作激励</h2>
					<p className='text-muted-foreground mt-6'>首作 ¥20 保底与传播奖直接叠加，新项目不限次数</p>
				</div>

				<fieldset
					aria-label='发布平台'
					className='bg-muted mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full p-1'
				>
					{bountyTracks.map((item) => (
						<button
							key={item.id}
							type='button'
							aria-pressed={track === item.id}
							className={cn(
								'text-muted-foreground rounded-full px-4 py-2 text-sm transition-colors',
								track === item.id && 'bg-primary text-primary-foreground',
							)}
							onClick={() => setTrack(item.id)}
						>
							{item.label}
						</button>
					))}
				</fieldset>

				<div className='bg-card mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-5'>
					{bountyTiers.map((tier) => (
						<div
							key={tier.level}
							className='outline-border p-6 outline'
						>
							<p className='text-muted-foreground text-sm'>{tier.level}</p>
							<p className={cn('mt-6 text-3xl font-semibold tabular-nums', tier.top && 'text-brand')}>
								{tier.amount}
							</p>
							<p className='text-muted-foreground mt-2 text-sm'>{tier.requirement[track]}</p>
						</div>
					))}
				</div>

				<p className='text-muted-foreground mt-8 text-center text-sm'>
					活动截止 12 月 31 日 · 线上链接与帖子公开保留满 7 天 · 单项目取最高单篇于 1 月统一结算
				</p>
			</div>
		</section>
	);
}
