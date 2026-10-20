export const scenarios = [
	'当你用 Vibe Coding 写完一段代码，想让它跑到线上的时候。',
	'当你本地目录有一份源代码，想要部署的时候。',
	'当你看到一个不错的 GitHub 开源项目，想把它运行起来的时候。',
	'当你想使用一个已经封装好的服务端项目的时候。',
	'当你的业务想要运行在生产环境中的时候。',
] as const;

export const desktopBenefits = [
	{
		image: 'local-development',
		title: '本地开发预览、云端线上部署',
		description: (
			<>
				用 AI 在本地写完代码，<strong>上线部署的事情交给 Sealos Agent。</strong>
			</>
		),
	},
	{
		image: 'local-agents',
		title: '借力你本机的强 Agent',
		description: (
			<>
				构建发布与后续运维中，Sealos 直接调用你本机已安装的 <strong>Codex、Claude Code、Gemini CLI</strong>{' '}
				等泛化 Agent 的能力，极大提升部署的正确性与成功率。
			</>
		),
	},
	{
		image: 'dependencies',
		title: '解决项目所有依赖',
		description: (
			<>
				别的 Agent 只帮你写代码，但 Sealos 可以帮你把项目依赖的
				<strong>所有数据库、对象存储、缓存、网络出口、域名、网关</strong>等问题全部解决。
			</>
		),
	},
] as const;

export const features = [
	{
		image: 'launch',
		title: '轻松上线',
		description: (
			<>
				从代码到上线，<strong>Agent 自动分析</strong>，一键生成访问链接
			</>
		),
	},
	{
		image: 'debug',
		title: '持续运维与 Debug',
		description: (
			<>
				Agent 智能排查故障，提供解决方案并<strong>自动执行安全操作</strong>。
			</>
		),
	},
	{
		image: 'agents',
		title: '调用本地 Agent 能力',
		description: (
			<>
				灵活调用<strong>主流 AI 工具</strong>，内置 Agent 开箱即用
			</>
		),
	},
	{
		image: 'topology',
		title: '资源拓扑',
		description: (
			<>
				<strong>一张拓扑图掌握</strong>项目架构与资源关系。
			</>
		),
	},
	{
		image: 'marketplace',
		title: '应用商店',
		description: (
			<>
				数百款模板即装即用，覆盖 GitHub <strong>9000+</strong> 个开源项目的部署需求。
			</>
		),
	},
] as const;

export const specialistBenefits = [
	{
		title: '专用，而非泛化',
		description:
			'一个专注于你的业务上线与后续运维的专用 Agent。在上线和运维这件事上，我们做了大量细节处理，确保效率、稳定性和使用体验。',
	},
	{
		title: '站在巨人的肩膀上',
		description:
			'你不用担心效果，底层 Agent 能力优先复用你本机已安装的 Claude Code、Codex、Gemini CLI。我们更关心的，是让 Agent 更懂 Sealos、更懂上线运维。',
	},
	{
		title: '只做上线与运维',
		description:
			'制作 PPT、写文案这类办公场景不是我们要做的。我们会把全部精力，花在业务如何上线、以及后续如何持续稳定运行上。',
	},
] as const;

export const workflows = [
	{
		image: 'deploy-flow',
		title: '上线你的业务系统',
		description:
			'本地代码、代码仓库、复杂业务系统，Agent 借助你本机的 Agent 能力完成分析、构建镜像、推送到线上，返回一个可访问的链接。',
		detail: '业务系统依赖再多，Agent 也能逐一分析，并在云端自动解决全部依赖。',
		alt: '分析项目、创建依赖、构建镜像、部署上线，返回应用访问链接。',
	},
	{
		image: 'debug-flow',
		title: '维护与 Debug',
		description: '网络不通、容器异常、错误日志、数据库故障，通通可以直接问 Agent。',
		detail: '它分析原因、给出合理方案，非危险操作直接帮你执行。',
		alt: '从日志、网络、容器与数据库收集现象，分析原因、给出方案、执行修复并验证恢复。',
	},
	{
		image: 'agent-flow',
		title: '运行你自己的 Agent',
		description:
			'把 Sealos 当成 Agent 的运行平台。Agent 与普通应用在 Sealos 中统一抽象，Agent 的特殊性在于消耗 AI Token，Sealos Desktop 直接帮你创建 Token 并挂载到业务系统中。',
		alt: '为 Agent 创建 AI Token，将其挂载到应用环境变量，并在云端运行。',
	},
] as const;

export const values = [
	['化繁为简', '全生命周期几乎无需人为干预。'],
	['资源成本', '按量计费，比包月更省。'],
	['人力成本', '不招基础设施人员，专注业务。'],
	['时间成本', '上线压缩到分钟级。'],
	['稳定安全', 'Sealos 团队是你的基础设施团队。'],
] as const;

export const milestones = [
	{
		stage: '起点',
		title: '做一个云操作系统',
		description:
			'你不用担心效果，底层 Agent 能力优先复用你本机已安装的 Claude Code、Codex、Gemini CLI。我们更关心的，是让 Agent 更懂 Sealos、更懂上线运维。',
	},
	{
		stage: '探索',
		title: '在实践中复盘',
		description: 'Sealos Desktop 花了我们很多的精力、思考和探索，才做出今天我们相当满意的产品。',
	},
	{
		stage: '今天',
		title: 'AI 是操作系统的最后一环',
		description:
			'AI 可以把整个用户界面简化到极致。Sealos Desktop 的诞生，把整个拼图的最后一块完整拼上了——这是里程碑意义的一步。',
	},
	{
		stage: '未来',
		title: '持续优化',
		description: '我们还有做得不完善的地方：稳定性、安全性、性价比、应用生态，都会持续去优化。希望你也会喜欢。',
	},
] as const;

export const faqs = [
	['最小计费单位是什么？', '资源按量计费，具体计费单位与价格请在控制台的费用中心查看。'],
	['新用户有什么优惠？', '登录控制台查看当前的新用户活动与可领取权益。'],
	['如何控制成本？', '根据业务负载选择资源规格，设置弹性伸缩，并在费用中心关注资源用量与账单。'],
	['支持哪些付款方式？', '请在控制台的费用中心查看当前区域可用的充值与付款方式。'],
] as const;
