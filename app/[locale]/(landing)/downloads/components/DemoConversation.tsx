'use client';

import { cjk } from '@streamdown/cjk';
import { useReducedMotion } from 'motion/react';
import Image from 'next/image';
import React from 'react';
import { Streamdown } from 'streamdown';
import { useStickToBottom } from 'use-stick-to-bottom';
import { Icon } from '@/libs/components/ui/icon';
import { demoIcons, eaglercraftServer, nginx } from '../assets/demo';
import { type DemoConversationId, demoConversations } from '../utils/demo-conversations';
import { characterInterval, demoReplays, deploymentStepInterval, deploymentSteps } from '../utils/demo-replay';
import styles from './DemoConversation.module.css';

function PublicLink({ href }: { href: string }) {
	return (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
		>
			{href}
		</a>
	);
}
function UserMessage({ children, parameters = false }: { children: React.ReactNode; parameters?: boolean }) {
	return (
		<div className={styles['userMessage']}>
			<p>{children}</p>
			{parameters && (
				<dl>
					<dt>minecraft_version</dt>
					<dd>1.12</dd>
				</dl>
			)}
		</div>
	);
}
function WorkTime({ children }: { children: React.ReactNode }) {
	return (
		<p className={styles['workTime']}>
			{children}
			<Icon
				src={demoIcons.chevron}
				alt=''
			/>
		</p>
	);
}
function MessageFooter({ time }: { time: string }) {
	return (
		<footer className={styles['messageFooter']}>
			<Icon
				src={demoIcons.copy}
				alt=''
			/>
			<time>{time}</time>
		</footer>
	);
}
function DeploymentCard({ conversation, progress }: { conversation: DemoConversationId; progress: number }) {
	const item = demoConversations[conversation];
	const minecraft = conversation === 'eaglercraft';
	const steps = deploymentSteps[conversation];
	const total = steps.length;
	const complete = progress >= total;
	return (
		<section
			className={styles['deployment']}
			aria-label={complete ? '部署完成' : '正在部署'}
			data-complete={complete}
		>
			<header>
				<span className={styles['successIcon']}>
					<Icon
						src={complete ? demoIcons.check : demoIcons.more}
						alt=''
					/>
				</span>
				<div>
					<p>
						{minecraft
							? '模板部署 · eaglercraft-server-tvbxdlaa'
							: '部署 project-facd43c0473641c0a3d942277c83737b'}
					</p>
					<strong>
						{complete
							? minecraft
								? 'eaglercraft-server 部署完成'
								: '部署完成'
							: minecraft
								? 'eaglercraft-server 部署中'
								: '正在部署'}
					</strong>
				</div>
				<span>
					{Math.min(progress, total)} / {total}
					<br />
					{complete ? (minecraft ? '3 分 27 秒' : '13 秒') : '部署中'}
				</span>
			</header>
			<ol>
				{steps.slice(0, progress).map((step, index) => (
					<li key={step}>
						<Icon
							src={demoIcons.check}
							alt=''
						/>
						{index === total - 1 ? (
							<div>
								{step}
								<PublicLink href={item.url} />
							</div>
						) : (
							<span>{step}</span>
						)}
					</li>
				))}
			</ol>
		</section>
	);
}
const markdownComponents = {
	a: ({ href, children }: React.ComponentProps<'a'>) => (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
		>
			{children}
		</a>
	),
	table: ({ children }: React.ComponentProps<'table'>) => (
		<div className={styles['parameterTable']}>
			<table>{children}</table>
		</div>
	),
};
const markdownPlugins = { cjk };

export function DemoConversation({ conversation }: { conversation: DemoConversationId }) {
	const item = demoConversations[conversation];
	const timeline = demoReplays[conversation];
	const reducedMotion = useReducedMotion();
	const [elapsed, setElapsed] = React.useState(0);
	const visibleElapsed = reducedMotion ? timeline.duration : elapsed;
	const playing = visibleElapsed < timeline.duration;
	const { scrollRef, contentRef, isAtBottom, scrollToBottom } = useStickToBottom({
		initial: 'instant',
		resize: reducedMotion ? 'instant' : 'smooth',
	});
	// The sidebar remounts this view on every conversation click; unmounting cancels its playback.
	React.useEffect(() => {
		if (reducedMotion) return;
		const started = performance.now();
		const timer = window.setInterval(() => {
			const next = Math.min(performance.now() - started, timeline.duration);
			setElapsed(next);
			if (next >= timeline.duration) window.clearInterval(timer);
		}, 40);
		return () => window.clearInterval(timer);
	}, [timeline.duration, reducedMotion]);
	return (
		<div className={styles['workspace']}>
			<div className={styles['chat']}>
				<header className={styles['chatHeader']}>
					<span title={item.title}>{item.title}</span>
					<Icon
						src={demoIcons.chevron}
						alt=''
					/>
					<Icon
						src={demoIcons.plus}
						alt=''
					/>
				</header>
				<div className={styles['historyFrame']}>
					<div
						ref={scrollRef}
						className={styles['history']}
						role='log'
						aria-live='off'
						aria-busy={playing}
						aria-label={`${item.project} 对话记录`}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll streamed history independently.
						tabIndex={0}
					>
						<div
							ref={contentRef}
							className={styles['historyContent']}
						>
							{timeline.turns.map(
								(turn) =>
									visibleElapsed >= turn.start && (
										<React.Fragment key={turn.start}>
											<UserMessage parameters={turn.parameters}>{turn.prompt}</UserMessage>
											{visibleElapsed >= turn.responseStart && (
												<article className={styles['response']}>
													<WorkTime>
														{visibleElapsed < turn.end ? '正在输出…' : turn.work}
													</WorkTime>
													{turn.parts.map((part) => {
														if (visibleElapsed < part.start) return null;
														const streaming = visibleElapsed < part.end;
														if (part.type === 'deployment')
															return (
																<DeploymentCard
																	key={part.start}
																	conversation={conversation}
																	progress={Math.floor(
																		(visibleElapsed - part.start) /
																			deploymentStepInterval,
																	)}
																/>
															);
														const text = streaming
															? Array.from(part.text)
																	.slice(
																		0,
																		Math.floor(
																			(visibleElapsed - part.start) /
																				characterInterval,
																		),
																	)
																	.join('')
															: part.text;
														return (
															<Streamdown
																key={part.start}
																components={markdownComponents}
																plugins={markdownPlugins}
																controls={false}
																mode={streaming ? 'streaming' : 'static'}
																isAnimating={streaming}
																animated={false}
																parseIncompleteMarkdown={streaming}
																className={styles['markdown']}
															>
																{text}
															</Streamdown>
														);
													})}
													{visibleElapsed >= turn.end && <MessageFooter time={turn.time} />}
												</article>
											)}
										</React.Fragment>
									),
							)}
						</div>
					</div>
					{!isAtBottom && (
						<button
							type='button'
							className={styles['latest']}
							onClick={() => void scrollToBottom({ animation: 'instant' })}
						>
							↓ 最新输出
						</button>
					)}
				</div>
				<div className={styles['composer']}>
					<p>提出后续修改要求</p>
					<div>
						<span>
							<Icon
								src={demoIcons.plus}
								alt=''
							/>
							<Icon
								src={demoIcons.hand}
								alt=''
							/>
						</span>
						<span>
							deepseek-v4.1-flash
							<Icon
								src={demoIcons.chevron}
								alt=''
							/>
							<Icon
								src={demoIcons.brain}
								alt=''
							/>
							<span>高</span>
							<i>
								<Icon
									src={demoIcons.arrow}
									alt=''
								/>
							</i>
						</span>
					</div>
				</div>
			</div>
			<section
				className={styles['architecture']}
				aria-label={`${item.project} 项目架构`}
			>
				<header>
					<span>
						<Icon
							src={demoIcons.gateway}
							alt=''
						/>
						架构
					</span>
					<span>监控</span>
					<span>日志</span>
					<span>设置</span>
					<Icon
						src={demoIcons.plus}
						alt=''
					/>
				</header>
				<div className={styles['canvas']}>
					<article className={styles['service']}>
						<header>
							<Image
								src={conversation === 'nginx' ? nginx : eaglercraftServer}
								alt=''
								width={24}
								height={24}
							/>
							<div>
								<strong>{item.service}</strong>
								<p title={item.image}>{item.image}</p>
							</div>
						</header>
						<p className={styles['status']}>
							<i />
							运行中
						</p>
						<footer>
							<Icon
								src={demoIcons.globe}
								alt=''
							/>
							<PublicLink href={item.url} />
						</footer>
					</article>
					<span className={styles['addService']}>
						<Icon
							src={demoIcons.plus}
							alt=''
						/>
						添加服务
					</span>
				</div>
			</section>
		</div>
	);
}
