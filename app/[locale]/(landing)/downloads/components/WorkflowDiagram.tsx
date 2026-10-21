import {
	CheckOverFrameIcon,
	FramedPrivateIcon,
	Number01Icon,
	Number02Icon,
	Number03Icon,
	Number04Icon,
	Number05Icon,
} from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';
import { agentConnections, debugConnections } from '../assets';
import styles from './WorkflowDiagram.module.css';

const deploySteps = [
	{ title: '分析项目', detail: '识别框架、依赖与运行时', icon: Number01Icon },
	{ title: '创建依赖', detail: '数据库 / 缓存 / 对象存储 / API Key', icon: Number02Icon },
	{ title: '本地构建镜像，无需复杂配置', detail: '', icon: Number03Icon },
	{ title: '部署上线', detail: '推送至 Sealos Cloud', icon: Number04Icon },
] as const;

const debugSteps = [
	{ title: '收集现象', icon: Number01Icon },
	{ title: '分析原因', icon: Number02Icon },
	{ title: '给出方案', icon: Number03Icon },
	{ title: '持续观察', icon: Number05Icon },
	{ title: '验证恢复', icon: Number03Icon },
	{ title: '执行修复', icon: Number04Icon },
] as const;

export function WorkflowDiagram({ kind, label }: { kind: 'deploy-flow' | 'debug-flow' | 'agent-flow'; label: string }) {
	return (
		<div
			className={cn(styles['diagram'], styles[kind])}
			role='img'
			aria-label={label}
		>
			<div
				className={styles['canvas']}
				aria-hidden='true'
			>
				{kind === 'deploy-flow' && (
					<>
						<div className={styles['deployLine']} />
						<div className={styles['deploySteps']}>
							{deploySteps.map(({ title, detail, icon }) => (
								<div
									className={styles['deployStep']}
									key={title}
								>
									<span className={styles['number']}>
										<Icon src={icon} />
									</span>
									<div>
										<span>{title}</span>
										{detail && <small>{detail}</small>}
									</div>
								</div>
							))}
							<div className={styles['deployStep']}>
								<span className={styles['number']}>
									<Icon src={CheckOverFrameIcon} />
								</span>
								<div>已上线 https://your-app.sealos.site</div>
							</div>
						</div>
					</>
				)}
				{kind === 'debug-flow' && (
					<>
						<Icon
							src={debugConnections}
							className={styles['connections']}
						/>
						{debugSteps.map(({ title, icon }, index) => (
							<div
								className={cn(
									styles['debugStep'],
									index > 2 && styles['bottomStep'],
									index === 5 && styles['execution'],
								)}
								style={{ left: `${((144.5 + (index % 3) * 253) / 809) * 100}%` }}
								key={title}
							>
								<span>{title}</span>
								<span className={styles['number']}>
									<Icon src={icon} />
								</span>
							</div>
						))}
						<div className={styles['debugContext']}>
							<div>日志 / 网络 / 容器 / 数据库</div>
							<div>
								<Icon src={FramedPrivateIcon} />
								非危险操作可直接执行
							</div>
						</div>
					</>
				)}
				{kind === 'agent-flow' && (
					<>
						<Icon
							src={agentConnections}
							className={styles['connections']}
						/>
						<div className={styles['agentSteps']}>
							<div>收集现象</div>
							<div>
								<span>
									Sealos Desktop
									<br />
									分析与部署
								</span>
							</div>
							<div>
								<span>
									云端 Agent 用<br />
									my-agent-app
								</span>
							</div>
						</div>
						<div className={styles['tokenService']}>
							<span>
								模型服务
								<br />
								创建 Token / API Key
							</span>
						</div>
						<div className={styles['tokenCaption']}>挂载到应用环境变量</div>
					</>
				)}
			</div>
		</div>
	);
}
