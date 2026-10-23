'use client';

import { useReducedMotion } from 'motion/react';
import React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import { demoIcons } from '../assets/demo';
import { demoReplays, teableApproval, teableIntroduction } from '../utils/demo-replay';
import { DemoConversation } from './DemoConversation';
import { DemoCursor } from './DemoCursor';
import styles from './DesktopDemo.module.css';
import { DemoNewTask } from './DesktopDemoPages';

const introductionDuration = teableIntroduction.end;
const duration = introductionDuration + demoReplays.teable.duration;

export function DemoTeable({ visible }: { visible: boolean }) {
	const reducedMotion = useReducedMotion();
	const surface = React.useRef<HTMLDivElement>(null);
	const [elapsed, setElapsed] = React.useState(0);
	const [paused, setPaused] = React.useState(false);
	const [documentVisible, setDocumentVisible] = React.useState(true);
	const complete = elapsed >= duration;
	const introduction = elapsed < introductionDuration;
	React.useEffect(() => {
		const update = () => setDocumentVisible(!document.hidden);
		update();
		document.addEventListener('visibilitychange', update);
		return () => document.removeEventListener('visibilitychange', update);
	}, []);
	React.useEffect(() => {
		if (reducedMotion || paused || !visible || !documentVisible || complete) return;
		let previous = performance.now();
		const timer = window.setInterval(() => {
			const now = performance.now();
			const delta = now - previous;
			previous = now;
			setElapsed((value) => Math.min(duration, value + delta));
		}, 40);
		return () => window.clearInterval(timer);
	}, [reducedMotion, paused, visible, documentVisible, complete]);
	const replay = () => {
		setElapsed(0);
		setPaused(false);
	};
	const controls = (
		<div className={styles['playbackControls']}>
			<span title='基于真实部署流程，等待时间已压缩'>流程演示</span>
			{!reducedMotion && !complete && (
				<button
					type='button'
					onClick={() => setPaused((value) => !value)}
					aria-label={paused ? '继续 Teable 部署演示' : '暂停 Teable 部署演示'}
				>
					{paused ? '继续' : '暂停'}
				</button>
			)}
			<button
				type='button'
				onClick={reducedMotion ? () => setElapsed(duration) : replay}
			>
				{reducedMotion ? '查看部署结果' : '重播'}
			</button>
		</div>
	);
	// Reduced-motion visitors choose when to view the completed snapshot.

	return (
		<div
			ref={surface}
			className={styles['playbackSurface']}
		>
			{introduction ? (
				<>
					<div className={styles['introControls']}>{controls}</div>
					<div className={styles['introPage']}>
						<DemoNewTask
							localStage={elapsed < teableIntroduction.selected ? 'choose' : 'selected'}
							onLocalDeploy={() => setElapsed(reducedMotion ? duration : teableIntroduction.open)}
							onSubmit={() => setElapsed(introductionDuration)}
						/>
					</div>
					{elapsed >= teableIntroduction.open && elapsed < teableIntroduction.selected && (
						<section
							className={styles['directoryPreview']}
							aria-label='模拟选择本地源码目录'
						>
							<header>
								<Icon
									src={demoIcons.folder}
									alt=''
								/>
								<strong>选择本地源码目录</strong>
							</header>
							<p>GitHub</p>
							<div
								data-demo-target='folder'
								data-selected={elapsed >= 2700}
							>
								<Icon
									src={demoIcons.folder}
									alt=''
								/>
								<strong>teable</strong>
								<Icon
									src={demoIcons.check}
									alt=''
								/>
							</div>
							<footer>
								<span>pnpm workspace</span>
								<button
									type='button'
									onClick={() => setElapsed(teableIntroduction.selected)}
									data-demo-target='choose'
								>
									选择文件夹
								</button>
							</footer>
						</section>
					)}
				</>
			) : (
				<DemoConversation
					conversation='teable'
					elapsed={elapsed - introductionDuration}
					controls={controls}
					onApprove={() => teableApproval && setElapsed(introductionDuration + teableApproval.end)}
				/>
			)}
			{!reducedMotion && (
				<DemoCursor
					surface={surface}
					elapsed={elapsed}
				/>
			)}
		</div>
	);
}
