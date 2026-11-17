import Image from 'next/image';
import type React from 'react';
import { siDocker, siGithub } from 'simple-icons';
import { DatabaseIcon, FramedCodeIcon, TemplateIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { SimpleIcon } from '@/libs/components/ui/simple-icon';
import { cn } from '@/libs/utils/styling';
import { participationDesktop } from '../assets';
import { bountyTiers } from '../utils/showcase.config';
import css from './ParticipationScenes.module.css';
import { PlatformBadge } from './PlatformBadge';

type SceneProps = { active: boolean };
type SequenceStyle = React.CSSProperties & { '--order': number };
const platforms = ['公众号', '知乎', 'X', '小红书', 'B站', '抖音'] as const;
const tags = ['#Sealos', '#SealosDesktop', '#VibeCoding'];
const entries = [
	{
		title: '本地代码',
		detail: '选择本地源码目录',
		icon: (
			<Icon
				src={FramedCodeIcon}
				alt=''
			/>
		),
	},
	{ title: '代码仓库', detail: '从源码构建并部署', icon: <SimpleIcon d={siGithub.path} /> },
	{
		title: '模版库',
		detail: '从模板库创建应用',
		icon: (
			<Icon
				src={TemplateIcon}
				alt=''
			/>
		),
	},
	{
		title: '数据库',
		detail: 'PostgreSQL 等',
		icon: (
			<Icon
				src={DatabaseIcon}
				alt=''
			/>
		),
	},
	{ title: '部署 Docker', detail: '运行任意容器镜像', icon: <SimpleIcon d={siDocker.path} /> },
];

function DemoCursor({ className }: { className: string | undefined }) {
	return (
		<span className={cn(css['cursor'], className)}>
			<svg
				viewBox='0 0 24 28'
				aria-hidden='true'
				focusable='false'
			>
				<path
					d='M3 2v20l5-5 4 9 4-2-4-8h8L3 2Z'
					fill='white'
					stroke='#171717'
					strokeWidth='1.5'
					strokeLinejoin='round'
				/>
			</svg>
		</span>
	);
}

export function DeploymentScene({ active }: SceneProps) {
	return (
		<div
			className={css['scene']}
			data-active={active}
		>
			<div className={css['entries']}>
				{entries.map((entry, index) => (
					<div
						key={entry.title}
						className={css['entry']}
						style={{ '--order': index } satisfies SequenceStyle}
					>
						<div className={css['entryHead']}>
							<span className={css['entryIcon']}>{entry.icon}</span>
							<span>{entry.title}</span>
						</div>
						<span className={css['entryDetail']}>{entry.detail}</span>
					</div>
				))}
				<span className={css['deployAction']}>
					立即部署
					<DemoCursor className={css['deployCursor']} />
				</span>
			</div>
		</div>
	);
}

export function SharingScene({ active }: SceneProps) {
	return (
		<div
			className={css['scene']}
			data-active={active}
		>
			<div className={css['platforms']}>
				{platforms.map((platform, index) => (
					<span
						key={platform}
						className={css['platform']}
						style={{ '--order': index } satisfies SequenceStyle}
					>
						<PlatformBadge
							platform={platform}
							className={css['platformMark']}
						/>
					</span>
				))}
			</div>
			<div className={css['post']}>
				<Image
					src={participationDesktop}
					alt=''
					sizes='300px'
					className={css['preview']}
					priority
				/>
				<p className={css['postTitle']}>我在 Sealos 上部署的项目</p>
				<div className={css['insertedTags']}>
					{tags.map((tag, index) => (
						<span
							key={tag}
							style={{ '--order': index } satisfies SequenceStyle}
						>
							{tag}
						</span>
					))}
				</div>
				<div className={css['tags']}>
					{tags.map((tag, index) => (
						<span
							key={tag}
							className={css['tag']}
							style={{ '--order': index } satisfies SequenceStyle}
						>
							{tag}
						</span>
					))}
					<DemoCursor className={css['shareCursor']} />
				</div>
			</div>
		</div>
	);
}

export function RewardScene({ active }: SceneProps) {
	return (
		<div
			className={css['scene']}
			data-active={active}
		>
			{/* Heights illustrate the ordered levels, not monetary proportions. Rules below carry the exact thresholds. */}
			<div className={css['rewardChart']}>
				{bountyTiers.map((tier, index) => (
					<div
						key={tier.level}
						className={css['tier']}
						style={{ '--order': index } satisfies SequenceStyle}
					>
						{tier.top && <strong className={css['maximum']}>{tier.amount}</strong>}
						<span className={css['tierBar']} />
						<span className={css['tierLabel']}>{tier.level.split(' ')[0]}</span>
					</div>
				))}
			</div>
			<svg
				className={css['growthArrow']}
				viewBox='0 0 340 150'
				fill='none'
				aria-hidden='true'
				focusable='false'
			>
				<path
					className={css['arrowLine']}
					d='M12 122Q180 102 326 9'
				/>
				<path
					className={css['arrowHead']}
					d='M309.3 12.5 326 9 315.7 22.7'
				/>
			</svg>
		</div>
	);
}
