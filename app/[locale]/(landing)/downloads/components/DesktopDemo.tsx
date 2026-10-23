'use client';

import { useInView, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';
import { demoIcons, eaglercraftServer } from '../assets/demo';
import { type DemoConversationId, demoConversations } from '../utils/demo-conversations';
import styles from './DesktopDemo.module.css';
import { DemoGateway, DemoNewTask, DemoProjects, DemoStorage } from './DesktopDemoPages';

const DemoConversation = dynamic(() => import('./DemoConversation').then((module) => module.DemoConversation), {
	loading: () => <output className={styles['conversationLoading']}>正在加载对话…</output>,
});

const DemoTeable = dynamic(() => import('./DemoTeable').then((module) => module.DemoTeable), {
	loading: () => <output className={styles['conversationLoading']}>正在加载本地代码上线演示…</output>,
});

const menus = [
	{ id: 'task', label: '新建任务', icon: demoIcons.plus },
	{ id: 'projects', label: '全部项目', icon: demoIcons.projects },
	{ id: 'storage', label: '对象存储', icon: demoIcons.storage },
	{ id: 'gateway', label: 'AI 网关', icon: demoIcons.gateway },
] as const;
type DemoPage = (typeof menus)[number]['id'] | DemoConversationId;

// Workspace pages and conversations use a fixed snapshot of the supplied App examples.
export function DesktopDemo({ autoPlay = false }: { autoPlay?: boolean }) {
	const [page, setPage] = React.useState<DemoPage>('task');
	const [replay, setReplay] = React.useState(0);
	const demoRef = React.useRef<HTMLElement>(null);
	const visible = useInView(demoRef, { amount: 0.5 });
	const reducedMotion = useReducedMotion();
	const autoStarted = React.useRef(false);
	const navigate = (next: DemoPage) => {
		autoStarted.current = true;
		setPage(next);
	};
	React.useEffect(() => {
		if (!autoPlay || !visible || reducedMotion !== false || autoStarted.current) return;
		const timer = window.setTimeout(() => {
			if (autoStarted.current) return;
			autoStarted.current = true;
			setPage('teable');
		}, 900);
		return () => window.clearTimeout(timer);
	}, [autoPlay, visible, reducedMotion]);
	const id = React.useId();
	const newTaskButton = React.useRef<HTMLButtonElement>(null);
	return (
		<section
			className={styles['demo']}
			ref={demoRef}
			aria-label='Sealos App 交互演示'
		>
			<aside className={styles['sidebar']}>
				<div
					className={styles['windowBar']}
					aria-hidden='true'
				>
					<div className={styles['trafficLights']}>
						<i />
						<i />
						<i />
					</div>
					<Icon
						src={demoIcons.sidebar}
						alt=''
					/>
				</div>
				<div className={styles['brand']}>
					<Icon
						src={demoIcons.sealos}
						alt=''
					/>
					<strong>Sealos</strong>
				</div>
				<nav
					className={styles['navigation']}
					aria-label='演示页面'
				>
					{menus.map((menu) => (
						<button
							type='button'
							key={menu.id}
							id={`${id}-${menu.id}`}
							ref={menu.id === 'task' ? newTaskButton : undefined}
							aria-pressed={page === menu.id}
							aria-controls={`${id}-panel`}
							onClick={() => navigate(menu.id)}
						>
							<Icon
								src={menu.icon}
								alt=''
							/>
							<span>{menu.label}</span>
						</button>
					))}
				</nav>
				<div className={styles['sidebarProjects']}>
					<p>项目</p>
					{(['teable', 'nginx', 'eaglercraft'] as const).map((conversation) => {
						const item = demoConversations[conversation];
						return (
							<div
								key={conversation}
								className={styles['conversationEntry']}
							>
								<div className={styles['projectName']}>
									{conversation !== 'eaglercraft' ? (
										<span className={styles['initial']}>
											{conversation === 'teable' ? 'T' : 'N'}
										</span>
									) : (
										<Image
											src={eaglercraftServer}
											width={18}
											height={18}
											alt=''
										/>
									)}
									<span title={item.project}>{item.project}</span>
								</div>
								<button
									type='button'
									id={`${id}-${conversation}`}
									className={styles['taskName']}
									aria-pressed={page === conversation}
									aria-controls={`${id}-panel`}
									title={item.title}
									onClick={() => {
										navigate(conversation);
										setReplay((value) => value + 1);
									}}
								>
									<i />
									<span>{item.title}</span>
								</button>
							</div>
						);
					})}
				</div>
				<div className={styles['account']}>
					<span>
						S<i />
					</span>
					sealos-user
				</div>
			</aside>
			<section
				key={page}
				id={`${id}-panel`}
				aria-labelledby={`${id}-${page}`}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need focus to scroll the demo content.
				tabIndex={0}
				className={cn(
					styles['panel'],
					page === 'task' && styles['newTaskPanel'],
					(page === 'nginx' || page === 'eaglercraft' || page === 'teable') && styles['conversationPanel'],
				)}
			>
				{page === 'task' && (
					<DemoNewTask
						onLocalDeploy={() => {
							navigate('teable');
							setReplay((value) => value + 1);
						}}
					/>
				)}
				{page === 'teable' && (
					<DemoTeable
						key={replay}
						visible={visible}
					/>
				)}
				{page === 'projects' && (
					<DemoProjects
						onNewProject={() => {
							navigate('task');
							newTaskButton.current?.focus();
						}}
					/>
				)}
				{page === 'storage' && <DemoStorage />}
				{page === 'gateway' && <DemoGateway />}
				{(page === 'nginx' || page === 'eaglercraft') && (
					<DemoConversation
						key={`${page}-${replay}`}
						conversation={page}
					/>
				)}
			</section>
		</section>
	);
}
