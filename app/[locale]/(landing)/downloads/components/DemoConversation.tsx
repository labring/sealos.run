'use client';

import Image from 'next/image';
import React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import { demoIcons, eaglercraftServer, nginx } from '../assets/demo';
import { type DemoConversationId, demoConversations } from '../utils/demo-conversations';
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
function DeploymentCard({ minecraft = false }: { minecraft?: boolean }) {
	const item = minecraft ? demoConversations.eaglercraft : demoConversations.nginx;
	const steps = minecraft
		? ['模板 eaglercraft-server 已受理', '平台资源已创建', '服务 eaglercraft-server-tvbxdlaa 启动完成']
		: ['服务 nginx 已创建'];
	return (
		<section
			className={styles['deployment']}
			aria-label='部署完成'
		>
			<header>
				<span className={styles['successIcon']}>
					<Icon
						src={demoIcons.check}
						alt=''
					/>
				</span>
				<div>
					<p>
						{minecraft
							? '模板部署 · eaglercraft-server-tvbxdlaa'
							: '部署 project-facd43c0473641c0a3d942277c83737b'}
					</p>
					<strong>{minecraft ? 'eaglercraft-server 部署完成' : '部署完成'}</strong>
				</div>
				<span>
					{minecraft ? '4 / 4' : '2 / 2'}
					<br />
					{minecraft ? '3 分 27 秒' : '13 秒'}
				</span>
			</header>
			<ol>
				{steps.map((step) => (
					<li key={step}>
						<Icon
							src={demoIcons.check}
							alt=''
						/>
						<span>{step}</span>
					</li>
				))}
				<li>
					<Icon
						src={demoIcons.check}
						alt=''
					/>
					<div>
						公网地址可访问
						<PublicLink href={item.url} />
					</div>
				</li>
			</ol>
		</section>
	);
}
function NginxHistory() {
	return (
		<>
			<UserMessage>{demoConversations.nginx.prompt}</UserMessage>
			<article className={styles['response']}>
				<WorkTime>已工作 1 分 9 秒</WorkTime>
				<DeploymentCard />
				<p>nginx 已经部署好并在运行。</p>
				<ul>
					<li>
						项目：<code>project-facd43c0473641c0a3d942277c83737b</code>（原本是空的，本次新增 1 个成员）
					</li>
					<li>
						成员：<code>nginx</code>（Deployment），镜像 <code>nginx:stable</code>，1 副本，0.2 核 /
						256MiB，容器端口 80，已开公网
					</li>
					<li>
						状态：1/1 就绪，Pod <code>nginx-6f6d878bc4-n9645</code> Running，0 次重启（已核对）
					</li>
					<li>
						访问地址：
						<PublicLink href={demoConversations.nginx.url} />
					</li>
				</ul>
				<p>
					模板库里没有独立的 nginx 模板（只有基于 NGINX 的 WAF 模板 bunkerweb），所以直接用了官方{' '}
					<code>nginx</code> 镜像部署。
				</p>
				<p>
					说明：这个 nginx
					提供的是默认欢迎页，没有你自己的静态文件或配置。如果要把本地代码/静态站点放上去，或者加一个数据库、对象存储，告诉我即可；也可以调整规格或副本数（upgrade_app）。
				</p>
				<MessageFooter time='23:35' />
			</article>
		</>
	);
}
function EaglercraftHistory() {
	return (
		<>
			<UserMessage>{demoConversations.eaglercraft.prompt}</UserMessage>
			<article className={styles['response']}>
				<WorkTime>已工作 10 秒</WorkTime>
				<p>方案已补齐，未部署。</p>
				<p>
					<strong>模板：</strong> eaglercraft-server（EaglercraftX 2.2.7 服务端，Paper
					世界持久化，浏览器里直接玩，带双语管理控制台）
				</p>
				<p>
					<strong>参数状态</strong>
				</p>
				<div className={styles['parameterTable']}>
					<table>
						<thead>
							<tr>
								<th>参数</th>
								<th>取值</th>
								<th>来源</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Minecraft 版本</td>
								<td>1.12（Paper 1.12.2）</td>
								<td>采用模板默认值</td>
							</tr>
							<tr>
								<td>RCON 管理密码</td>
								<td>已由平台随机生成并暂存（不出现在聊天里）</td>
								<td>平台生成凭据</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p>该模板只有这两个参数：没有用户名，也没有任何第三方 API Key 需要填写，所以没有可补的其他凭据。</p>
				<p>
					<strong>部署形态（供确认）</strong>：单实例 StatefulSet <code>eaglercraft-server</code>，端口
					5200（浏览器游戏）与 5201（安全 WebSocket），公开访问开启，200m CPU / 1024Mi 内存 / 1Gi
					持久卷。部署后会得到一个随机公网 HTTPS 地址。
				</p>
				<p>
					补充一句：你当前没有绑定项目，所以一旦部署就是新建一个项目（成员名不能与工作空间里已有的重名）。要部署时告诉我，我再执行。
				</p>
				<MessageFooter time='23:31' />
			</article>
			<UserMessage parameters>模板部署 eaglercraft-server</UserMessage>
			<article className={styles['response']}>
				<WorkTime>已工作 3 分 42 秒</WorkTime>
				<DeploymentCard minecraft />
				<p>部署完成，公网地址已验证可访问。</p>
				<p>
					<strong>项目：</strong>
					<code>eaglercraft-server-tvbxdlaa</code>（新建）
					<br />
					<strong>访问地址：</strong>
					<PublicLink href={demoConversations.eaglercraft.url} />
					<br />
					<strong>工作负载：</strong>StatefulSet <code>eaglercraft-server-tvbxdlaa</code>，1/1 就绪，端口
					5200（游戏）/ 5201（WebSocket），200m CPU / 1024Mi 内存 / 1Gi 持久卷
				</p>
				<p>
					<strong>参数</strong>
				</p>
				<ul>
					<li>Minecraft 版本：1.12（Paper 1.12.2）</li>
					<li>
						RCON 管理密码：<code title='管理密码已遮罩'>••••••••••••••••••••••••••••••••</code> ——
						这是控制台管理员登录和服务端命令用的密码，请自己留存好
					</li>
				</ul>
				<p>
					打开上面的地址就能在浏览器里进服，管理控制台在页面上用 RCON
					密码登录。世界数据保存在持久卷里，重启不丢。
				</p>
				<p>需要时我可以帮你看状态或日志、重启服务端，或者调整规格。</p>
				<MessageFooter time='23:35' />
			</article>
		</>
	);
}
export function DemoConversation({ conversation }: { conversation: DemoConversationId }) {
	const item = demoConversations[conversation];
	const history = React.useRef<HTMLDivElement>(null);
	React.useLayoutEffect(() => {
		const element = history.current;
		if (element) element.scrollTop = element.scrollHeight;
	}, []);
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
				<div
					ref={history}
					className={styles['history']}
					// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the conversation history.
					tabIndex={0}
					role='log'
					aria-label={`${item.project} 对话记录`}
				>
					{conversation === 'nginx' ? <NginxHistory /> : <EaglercraftHistory />}
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
