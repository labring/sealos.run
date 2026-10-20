'use client';

import Image from 'next/image';
import React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';
import { demoIcons, eaglercraftServer } from '../assets/demo';
import { type DemoConversationId, demoConversations } from '../utils/demo-conversations';
import { DemoConversation } from './DemoConversation';
import styles from './DesktopDemo.module.css';
import { DemoGateway, DemoNewTask, DemoProjects, DemoStorage } from './DesktopDemoPages';

const menus = [
	{ id: 'task', label: '新建任务', icon: demoIcons.plus },
	{ id: 'projects', label: '全部项目', icon: demoIcons.projects },
	{ id: 'storage', label: '对象存储', icon: demoIcons.storage },
	{ id: 'gateway', label: 'AI 网关', icon: demoIcons.gateway },
] as const;
type DemoPage = (typeof menus)[number]['id'] | DemoConversationId;

// Workspace pages and conversations use a fixed snapshot of the supplied App examples.
export function DesktopDemo() {
	const [page, setPage] = React.useState<DemoPage>('task');
	const id = React.useId();
	const newTaskButton = React.useRef<HTMLButtonElement>(null);
	return (
		<section
			className={styles['demo']}
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
							onClick={() => setPage(menu.id)}
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
					{(['nginx', 'eaglercraft'] as const).map((conversation) => {
						const item = demoConversations[conversation];
						return (
							<div
								key={conversation}
								className={styles['conversationEntry']}
							>
								<div className={styles['projectName']}>
									{conversation === 'nginx' ? (
										<span className={styles['initial']}>N</span>
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
									onClick={() => setPage(conversation)}
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
					(page === 'nginx' || page === 'eaglercraft') && styles['conversationPanel'],
				)}
			>
				{page === 'task' && <DemoNewTask />}
				{page === 'projects' && (
					<DemoProjects
						onNewProject={() => {
							setPage('task');
							newTaskButton.current?.focus();
						}}
					/>
				)}
				{page === 'storage' && <DemoStorage />}
				{page === 'gateway' && <DemoGateway />}
				{(page === 'nginx' || page === 'eaglercraft') && <DemoConversation conversation={page} />}
			</section>
		</section>
	);
}
