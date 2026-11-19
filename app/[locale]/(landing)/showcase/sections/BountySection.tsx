'use client';

import { useInView } from 'motion/react';
import React from 'react';
import { cn } from '@/libs/utils/styling';
import { type BountyTrack, bountyTiers, bountyTracks, showcaseLinks } from '../utils/showcase.config';
import css from './BountySection.module.css';

export function BountySection() {
	const sectionRef = React.useRef<HTMLElement>(null);
	const entered = useInView(sectionRef, { once: true, amount: 0.15 });
	const [track, setTrack] = React.useState<BountyTrack>('deep');
	return (
		<section
			id='bounty'
			className={css['section']}
			ref={sectionRef}
			data-visible={entered}
		>
			<div className={css['container']}>
				<header className={css['heading']}>
					<h2>纯现金创作激励</h2>
					<p>首次发帖领 ¥20，流量达标再赢高额现金。</p>
				</header>
				<fieldset
					className={css['tracks']}
					aria-label='奖励适用的发布平台'
				>
					{bountyTracks.map((item) => (
						<button
							key={item.id}
							type='button'
							aria-pressed={track === item.id}
							onClick={() => setTrack(item.id)}
							className={cn(css['track'], track === item.id && css['active'])}
						>
							{item.label}
						</button>
					))}
				</fieldset>
				{/* Length identifies successive tiers, not the relative cash amounts. */}
				<ol className={css['tiers']}>
					{bountyTiers.map((tier, index) => (
						<li
							key={tier.level}
							className={css['tier']}
							style={{ '--tier': index }}
						>
							<div className={css['tierInfo']}>
								<span>{tier.level}</span>
								<span>{tier.requirement[track]}</span>
							</div>
							<strong className={cn(css['amount'], tier.top && css['topAmount'])}>{tier.amount}</strong>
						</li>
					))}
				</ol>
				<p className={css['note']}>
					活动截止 12 月 31 日 · 线上链接与帖子公开保留满 7 天 · 单项目取最高单篇于 1 月统一结算
					{' · '}
					<a
						href={showcaseLinks.applicationForm}
						target='_blank'
						rel='noopener noreferrer'
						className='underline'
					>
						申请奖励
					</a>
				</p>
			</div>
		</section>
	);
}
