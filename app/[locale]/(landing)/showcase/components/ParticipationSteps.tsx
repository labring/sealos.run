'use client';

import { useInView } from 'motion/react';
import React from 'react';
import { ChevronDownIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { Link } from '@/libs/i18n/navigation';
import { showcaseLinks } from '../utils/showcase.config';
import { DeploymentScene, RewardScene, SharingScene } from './ParticipationScenes';
import css from './ParticipationSteps.module.css';

const steps = [
	{
		title: '用 Sealos Desktop 把项目上线',
		description: '拿到一个任何人都能打开的线上链接。',
		Scene: DeploymentScene,
	},
	{
		title: '发帖晒出制作过程',
		description: '在小红书、B站、公众号、知乎、抖音、视频号或 X 发帖，露出桌面端界面，带上活动话题。',
		Scene: SharingScene,
	},
	{ title: '提交作品，领现金', description: '首作保底 ¥20，按阅读量最高再领 ¥1,888。', Scene: RewardScene },
];

export function ParticipationSteps() {
	const [playback, setPlayback] = React.useState({ step: 0, replay: 0 });
	const [manuallyPaused, setManuallyPaused] = React.useState(false);
	const [pageVisible, setPageVisible] = React.useState(true);
	const [reducedMotion, setReducedMotion] = React.useState(true);
	const root = React.useRef<HTMLDivElement>(null);
	const visible = useInView(root, { amount: 0.35 });
	const id = React.useId();
	const suspended = !visible || !pageVisible || reducedMotion;
	const paused = manuallyPaused || suspended;

	React.useEffect(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
		const updateMotion = () => setReducedMotion(preference.matches);
		updateVisibility();
		updateMotion();
		document.addEventListener('visibilitychange', updateVisibility);
		preference.addEventListener('change', updateMotion);
		return () => {
			document.removeEventListener('visibilitychange', updateVisibility);
			preference.removeEventListener('change', updateMotion);
		};
	}, []);

	const select = (step: number) => setPlayback((previous) => ({ step, replay: previous.replay + 1 }));

	return (
		<div
			ref={root}
			className={css['wrapper']}
			data-paused={paused}
			data-suspended={suspended}
		>
			<ol
				id={`${id}-steps`}
				className={css['steps']}
				aria-label='参与活动的三个步骤'
			>
				{steps.map((step, index) => {
					const active = playback.step === index;
					const Scene = step.Scene;
					return (
						<li
							key={step.title}
							className={css['step']}
							data-active={active}
						>
							<div className={css['line']}>
								<button
									type='button'
									id={`${id}-step-${index}`}
									className={css['trigger']}
									aria-expanded={active}
									aria-controls={`${id}-scene-${index}`}
									onClick={() => select(index)}
								>
									<span className={css['number']}>0{index + 1}</span>
									<span className={css['copy']}>
										<span className={css['title']}>{step.title}</span>
										<span className={css['description']}>{step.description}</span>
									</span>
								</button>
								{index === 0 ? (
									<Link
										href={showcaseLinks.download}
										className={css['action']}
									>
										下载桌面端
									</Link>
								) : (
									<Icon
										src={ChevronDownIcon}
										className={css['chevron']}
										aria-hidden='true'
									/>
								)}
							</div>
							<section
								id={`${id}-scene-${index}`}
								className={css['panel']}
								aria-labelledby={`${id}-step-${index}`}
								aria-hidden={!active}
								inert={!active}
							>
								<div className={css['panelClip']}>
									<div
										key={active ? playback.replay : 'idle'}
										className={css['stage']}
										aria-hidden='true'
									>
										<Scene active={active} />
									</div>
								</div>
							</section>
							<div
								className={css['progress']}
								aria-hidden='true'
							>
								<span
									key={playback.replay}
									onAnimationEnd={() => {
										if (active) {
											setPlayback((previous) => ({
												step: (previous.step + 1) % steps.length,
												replay: previous.replay + 1,
											}));
										}
									}}
								/>
							</div>
						</li>
					);
				})}
			</ol>
			<div className={css['playback']}>
				<button
					type='button'
					aria-label={manuallyPaused ? '继续自动播放步骤' : '暂停自动播放步骤'}
					aria-controls={`${id}-steps`}
					onClick={() => setManuallyPaused((previous) => !previous)}
				>
					<span aria-hidden='true'>{manuallyPaused ? '▶' : 'Ⅱ'}</span>
					{manuallyPaused ? '继续轮播' : '暂停轮播'}
				</button>
			</div>
		</div>
	);
}
