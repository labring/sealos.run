import Image from 'next/image';
import type React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import {
	aceStep,
	affine,
	agora,
	airbyte,
	demoIcons,
	eaglercraftServer,
	methodDatabase,
	methodDocker,
	methodGithub,
	methodTemplate,
	nginx,
	sevendaystodie,
} from '../assets/demo';
import styles from './DesktopDemo.module.css';

const methods = [
	{ name: '本地代码上线', description: '选择本地源码目录', icon: demoIcons.folder },
	{ name: '代码仓库', description: '从源码构建并部署', image: methodGithub },
	{ name: '模板', description: '从模板库一键创建应用', image: methodTemplate },
	{ name: '数据库', description: 'PostgreSQL、Redis、MySQL、MongoDB', image: methodDatabase },
	{ name: '部署 Docker', description: '运行任意容器镜像', image: methodDocker },
];
const templates = [
	{
		name: '7daystodie',
		image: sevendaystodie,
		description: '自托管 7 Days to Die 专用服务器，提供持久化存档、LinuxGSM 管理和原生 TCP/UDP 访问。',
	},
	{
		name: 'ace-step',
		image: aceStep,
		description:
			'开源音乐生成AI。商业级质量，A100上每首歌不到2秒。支持文本生成音乐、翻唱、重绘、LoRA训练，支持50+语言。',
	},
	{
		name: 'affine',
		image: affine,
		description: 'AFFiNE 是一个隐私优先、本地优先的开源协作工作区，可用于笔记、文档、白板和团队知识管理。',
	},
	{
		name: 'agora',
		image: agora,
		description: 'Agora Token 服务用于生成 RTC 和 RTM Token，在用户访问 Agora 服务或加入 RTC 频道之前进行身份验证',
	},
	{ name: 'airbyte', image: airbyte, description: '开源数据集成平台，用于构建和调度 ELT 数据同步管道。' },
	{
		name: 'eaglercraft-server',
		image: eaglercraftServer,
		description: 'EaglercraftX 2.2.7 服务器，支持网页端游戏、安全 WebSocket 连接、双语管理面板和持久化 Paper 世界',
	},
];

function PreviewAction({ children }: { children: React.ReactNode }) {
	return (
		<span className={styles['primaryAction']}>
			<Icon
				src={demoIcons.plus}
				alt=''
			/>
			{children}
		</span>
	);
}
function PageHeader({ title, summary, action }: { title: string; summary: string; action: React.ReactNode }) {
	return (
		<header className={styles['pageHeader']}>
			<div>
				<h3>{title}</h3>
				<p>{summary}</p>
			</div>
			{action}
		</header>
	);
}

export function DemoNewTask() {
	return (
		<>
			<div className={styles['newTask']}>
				<h3>部署新的应用</h3>
				<p>描述你的想法，或选择下面的创建方式。</p>
				<div className={styles['composer']}>
					<p>描述你想部署的应用…</p>
					<div className={styles['composerToolbar']}>
						<span className={styles['addContext']}>
							<Icon
								src={demoIcons.plus}
								alt=''
							/>
						</span>
						<span>
							<Icon
								src={demoIcons.folder}
								alt=''
							/>
							选择项目
							<Icon
								src={demoIcons.chevron}
								alt=''
							/>
						</span>
						<span className={styles['mode']}>
							<Icon
								src={demoIcons.hand}
								alt=''
							/>
							变更前确认
							<Icon
								src={demoIcons.chevron}
								alt=''
							/>
						</span>
						<span className={styles['model']}>
							deepseek-v4.1-flash
							<Icon
								src={demoIcons.chevron}
								alt=''
							/>
						</span>
						<span>
							<Icon
								src={demoIcons.brain}
								alt=''
							/>
							高
							<Icon
								src={demoIcons.chevron}
								alt=''
							/>
						</span>
						<span className={styles['send']}>
							<Icon
								src={demoIcons.arrow}
								alt=''
							/>
						</span>
					</div>
				</div>
				<div className={styles['methods']}>
					{methods.map((item) => (
						<div
							key={item.name}
							className={styles['method']}
						>
							{item.image ? (
								<Image
									src={item.image}
									width={22}
									height={22}
									alt=''
								/>
							) : (
								item.icon && (
									<Icon
										src={item.icon}
										alt=''
									/>
								)
							)}
							<strong>{item.name}</strong>
							<p>{item.description}</p>
						</div>
					))}
				</div>
			</div>
			<section
				className={styles['templates']}
				aria-label='模板展示'
			>
				<div className={styles['templateBar']}>
					<span>全部模板</span>
					<span>AI</span>
					<span>数据库</span>
					<span>网站</span>
					<span>工具</span>
					<span className={styles['search']}>
						<Icon
							src={demoIcons.search}
							alt=''
						/>
						搜索模板…
					</span>
				</div>
				<div className={styles['templateGrid']}>
					{templates.map((item) => (
						<article key={item.name}>
							<header>
								<Image
									src={item.image}
									width={22}
									height={22}
									alt=''
								/>
								<strong>{item.name}</strong>
							</header>
							<p>{item.description}</p>
						</article>
					))}
				</div>
			</section>
		</>
	);
}

export function DemoProjects({ onNewProject }: { onNewProject: () => void }) {
	return (
		<>
			<PageHeader
				title='项目'
				summary='2 个项目 · 2 个服务运行中'
				action={
					<button
						type='button'
						className={styles['primaryAction']}
						onClick={onNewProject}
					>
						<Icon
							src={demoIcons.plus}
							alt=''
						/>
						新建项目
					</button>
				}
			/>
			<div className={styles['projectToolbar']}>
				<span className={styles['viewSwitch']}>
					<Icon
						src={demoIcons.grid}
						alt=''
					/>
					<Icon
						src={demoIcons.list}
						alt=''
					/>
				</span>
				<span>
					排序：<strong>创建时间</strong>
					<Icon
						src={demoIcons.chevron}
						alt=''
					/>
				</span>
			</div>
			<div className={styles['projectGrid']}>
				{[
					{ name: 'Nginx Web Server', image: nginx, initial: true, time: '4分钟前' },
					{ name: 'eaglercraft-server-tvbxdlaa', image: eaglercraftServer, time: '7分钟前' },
				].map((item) => (
					<article
						key={item.name}
						className={styles['projectCard']}
					>
						<header>
							{item.initial ? (
								<span className={styles['initial']}>N</span>
							) : (
								<Image
									src={item.image}
									width={24}
									height={24}
									alt=''
								/>
							)}
							<h4>{item.name}</h4>
						</header>
						<div className={styles['projectCanvas']}>
							<span className={styles['serviceLogo']}>
								<Image
									src={item.image}
									width={28}
									height={28}
									alt=''
								/>
								<i />
							</span>
							<footer>
								<span>
									<i />
									运行中 <span className={styles['muted']}>· 1/1 在线</span>
								</span>
								<span>{item.time}</span>
							</footer>
						</div>
					</article>
				))}
			</div>
		</>
	);
}

function Connection({
	description,
	action,
	rows,
}: {
	description: string;
	action?: React.ReactNode;
	rows: Array<[string, string]>;
}) {
	return (
		<section
			className={styles['connection']}
			aria-label='Connection'
		>
			<header>
				<div>
					<h4>Connection</h4>
					<p>{description}</p>
				</div>
				{action && <span>{action}</span>}
			</header>
			<dl>
				{rows.map(([label, value]) => (
					<div key={label}>
						<dt>{label}</dt>
						<dd>{value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

export function DemoStorage() {
	return (
		<>
			<PageHeader
				title='对象存储'
				summary='1 个存储桶 · 已用 2.4 MB / 20 GB'
				action={<PreviewAction>新建存储桶</PreviewAction>}
			/>
			<section
				className={styles['tableScroll']}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the wide table.
				tabIndex={0}
				aria-label='存储桶列表'
			>
				<table className={styles['dataTable']}>
					<thead>
						<tr>
							<th>名称</th>
							<th>权限</th>
							<th>容量</th>
							<th>对象数</th>
							<th>创建时间</th>
							<th>
								<span className={styles['srOnly']}>操作</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div className={styles['bucketName']}>
									<Icon
										src={demoIcons.storage}
										alt=''
									/>
									<strong>example-storage</strong>
								</div>
								<small>z0bxrnxj-example-storage</small>
							</td>
							<td>
								<span className={styles['pill']}>
									<i />
									私有
								</span>
							</td>
							<td>
								<span
									className={styles['unavailable']}
									role='img'
									aria-label='未显示容量'
								/>
							</td>
							<td>
								<span
									className={styles['unavailable']}
									role='img'
									aria-label='未显示对象数'
								/>
							</td>
							<td>10月10日</td>
							<td>
								<Icon
									src={demoIcons.more}
									alt=''
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</section>
			<Connection
				description='工作空间内所有存储桶共用一套密钥。把这些值复制到服务的 Variables 里。'
				action='重置 Secret Key'
				rows={[
					['Access Key', 'z0bxrnxj'],
					['Secret Key', '••••••••••••••••••••••••••••••••'],
					['内网 Endpoint', 'http://object-storage.objectstorage-system.svc.cluster.local'],
					['外网 Endpoint', 'https://objectstorageapi.bja.sealos.run'],
				]}
			/>
		</>
	);
}

export function DemoGateway() {
	return (
		<>
			<PageHeader
				title='AI 网关'
				summary='1 个 API key'
				action={<PreviewAction>新建 API key</PreviewAction>}
			/>
			<div className={styles['gatewayTabs']}>
				<span>API keys</span>
				<span>模型</span>
				<span>用量</span>
				<span>日志</span>
			</div>
			<section
				className={styles['tableScroll']}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the wide table.
				tabIndex={0}
				aria-label='API keys 列表'
			>
				<table className={styles['dataTable']}>
					<thead>
						<tr>
							<th>名称</th>
							<th>Key</th>
							<th>Tokens · 30 天</th>
							<th>费用 · 30 天</th>
							<th>最近使用</th>
							<th>状态</th>
							<th>
								<span className={styles['srOnly']}>操作</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{[['sealos-desktop', 'sk-…tAg6', '51.9K', '0.11', '11小时前']].map(
							([name, key, tokens, cost, time]) => (
								<tr key={name}>
									<td>
										<strong>{name}</strong>
									</td>
									<td>
										<code>{key}</code>
									</td>
									<td>{tokens}</td>
									<td>{cost}</td>
									<td>{time}</td>
									<td>
										<span className={styles['enabledPill']}>
											<i />
											启用
										</span>
									</td>
									<td>
										<Icon
											src={demoIcons.more}
											alt=''
										/>
									</td>
								</tr>
							),
						)}
					</tbody>
				</table>
			</section>
			<Connection
				description='上面每把 key 都用同一个 Endpoint，OpenAI 兼容客户端和 Anthropic 客户端都能用。'
				rows={[
					['Endpoint', 'https://aiproxy.bja.sealos.run'],
					['OpenAI base URL', 'https://aiproxy.bja.sealos.run/v1'],
					['Anthropic base URL', 'https://aiproxy.bja.sealos.run'],
				]}
			/>
			<section
				className={styles['codeExample']}
				aria-label='API 调用示例'
			>
				<header>
					示例
					<span>
						<b>curl</b>Python　 Node
					</span>
				</header>
				<pre>{`curl https://aiproxy.bja.sealos.run/v1/chat/completions \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "claude-sonnet-5",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`}</pre>
			</section>
		</>
	);
}
