import { type DemoConversationId, demoConversations } from './demo-conversations';

type ReplayPart =
	| { type: 'markdown'; text: string }
	| { type: 'deployment' }
	| { type: 'activity'; title: string; steps: string[] };
type ReplayTurn = { prompt: string; parameters?: boolean; work: string; time: string; parts: ReplayPart[] };

const nginx = demoConversations.nginx;
const eaglercraft = demoConversations.eaglercraft;
const turns = {
	teable: [
		{
			prompt: demoConversations.teable.prompt,
			work: '已完成',
			time: '13:55',
			parts: [
				{
					type: 'markdown',
					text: '项目当前为空。现在分析本地代码结构。\n\n这是 Teable 的 monorepo（pnpm workspace）。我并行看一下它的构建相关文件。',
				},
				{
					type: 'activity',
					title: '查阅项目',
					steps: [
						'package.json · pnpm-workspace.yaml',
						'dockers/teable/Dockerfile',
						'standalone compose · PostgreSQL + Redis',
					],
				},
				{
					type: 'markdown',
					text: '官方自带生产级多阶段 Dockerfile 与 standalone compose。现在开始构建，以仓库根为构建上下文，排除本地 .env 等敏感文件。',
				},
				{
					type: 'activity',
					title: '构建镜像',
					steps: [
						'拉取基础镜像',
						'安装 pnpm 依赖 · pnpm fetch',
						'生成 Prisma 客户端',
						'编译 Teable 前后端',
						'整理生产运行目录',
						'导出镜像 · linux/amd64',
					],
				},
				{ type: 'markdown', text: '构建成功（linux/amd64，上下文 69.4 MiB）。现在推送到工作空间镜像仓库。' },
				{ type: 'activity', title: '推送镜像', steps: ['上传镜像层 · 20 / 27', '镜像推送完成'] },
				{ type: 'markdown', text: '模板已写好（.sealos/template/index.yaml）。现在部署到绑定的 Sealos 项目。' },
				{
					type: 'activity',
					title: '确认部署',
					steps: ['Teable · 1 CPU / 2 GiB', 'PostgreSQL + Redis · 附件持久卷', '演示自动确认，开始部署'],
				},
				{ type: 'deployment' },
				{
					type: 'markdown',
					text: '部署完成并已验证。\n\n**Teable 已上线**\n\n- 工作负载：`teable-qmygpgcc-teable`，1/1 就绪，0 次重启\n- PostgreSQL、Redis 启动完成，数据库迁移成功\n- `/health`：`status: ok`，数据库连接正常\n- 登录页、注册页和静态资源均返回 200\n- 附件保存在持久卷中，重启不丢失。',
				},
			],
		},
	],
	nginx: [
		{
			prompt: nginx.prompt,
			work: '已工作 1 分 9 秒',
			time: '23:35',
			parts: [
				{ type: 'deployment' },
				{
					type: 'markdown',
					text: [
						'nginx 已经部署好并在运行。',
						'- 项目：`project-facd43c0473641c0a3d942277c83737b`（原本是空的，本次新增 1 个成员）\n- 成员：`nginx`（Deployment），镜像 `nginx:stable`，1 副本，0.2 核 / 256MiB，容器端口 80，已开公网\n- 状态：1/1 就绪，Pod `nginx-6f6d878bc4-n9645` Running，0 次重启（已核对）\n- 访问地址：' +
							nginx.url,
						'模板库里没有独立的 nginx 模板（只有基于 NGINX 的 WAF 模板 bunkerweb），所以直接用了官方 `nginx` 镜像部署。',
						'说明：这个 nginx 提供的是默认欢迎页，没有你自己的静态文件或配置。如果要把本地代码/静态站点放上去，或者加一个数据库、对象存储，告诉我即可；也可以调整规格或副本数（upgrade_app）。',
					].join('\n\n'),
				},
			],
		},
	],
	eaglercraft: [
		{
			prompt: eaglercraft.prompt,
			work: '已工作 10 秒',
			time: '23:31',
			parts: [
				{
					type: 'markdown',
					text: [
						'方案已补齐，未部署。',
						'**模板：** eaglercraft-server（EaglercraftX 2.2.7 服务端，Paper 世界持久化，浏览器里直接玩，带双语管理控制台）',
						'**参数状态**',
						'| 参数 | 取值 | 来源 |\n| --- | --- | --- |\n| Minecraft 版本 | 1.12（Paper 1.12.2） | 采用模板默认值 |\n| RCON 管理密码 | 已由平台随机生成并暂存（不出现在聊天里） | 平台生成凭据 |',
						'该模板只有这两个参数：没有用户名，也没有任何第三方 API Key 需要填写，所以没有可补的其他凭据。',
						'**部署形态（供确认）**：单实例 StatefulSet `eaglercraft-server`，端口 5200（浏览器游戏）与 5201（安全 WebSocket），公开访问开启，200m CPU / 1024Mi 内存 / 1Gi 持久卷。部署后会得到一个随机公网 HTTPS 地址。',
						'补充一句：你当前没有绑定项目，所以一旦部署就是新建一个项目（成员名不能与工作空间里已有的重名）。要部署时告诉我，我再执行。',
					].join('\n\n'),
				},
			],
		},
		{
			prompt: '模板部署 eaglercraft-server',
			parameters: true,
			work: '已工作 3 分 42 秒',
			time: '23:35',
			parts: [
				{ type: 'deployment' },
				{
					type: 'markdown',
					text: [
						'部署完成，公网地址已验证可访问。',
						'**项目：**`eaglercraft-server-tvbxdlaa`（新建）  \n**访问地址：**' +
							eaglercraft.url +
							'  \n**工作负载：**StatefulSet `eaglercraft-server-tvbxdlaa`，1/1 就绪，端口 5200（游戏）/ 5201（WebSocket），200m CPU / 1024Mi 内存 / 1Gi 持久卷',
						'**参数**',
						'- Minecraft 版本：1.12（Paper 1.12.2）\n- RCON 管理密码：`••••••••••••••••••••••••••••••••` —— 这是控制台管理员登录和服务端命令用的密码，请自己留存好',
						'打开上面的地址就能在浏览器里进服，管理控制台在页面上用 RCON 密码登录。世界数据保存在持久卷里，重启不丢。',
						'需要时我可以帮你看状态或日志、重启服务端，或者调整规格。',
					].join('\n\n'),
				},
			],
		},
	],
} satisfies Record<DemoConversationId, ReplayTurn[]>;

export const deploymentSteps = {
	teable: [
		'模板 teable 已受理',
		'平台资源已创建',
		'数据库 PostgreSQL 启动完成',
		'数据库 Redis 启动完成',
		'服务 teable-qmygpgcc-teable 启动完成',
		'公网地址可访问',
	],
	nginx: ['服务 nginx 已创建', '公网地址可访问'],
	eaglercraft: [
		'模板 eaglercraft-server 已受理',
		'平台资源已创建',
		'服务 eaglercraft-server-tvbxdlaa 启动完成',
		'公网地址可访问',
	],
};

export const characterInterval = 18;
export const deploymentStepInterval = 650;
export const activityStepInterval = 900;

function scheduleTurns(conversation: DemoConversationId, source: ReplayTurn[]) {
	let cursor = 0;
	const scheduled = source.map((turn) => {
		const start = cursor;
		const responseStart = start + 450;
		cursor = responseStart;
		const parts = turn.parts.map((part) => {
			const start = cursor;
			cursor +=
				part.type === 'markdown'
					? Array.from(part.text).length * characterInterval
					: part.type === 'activity'
						? part.steps.length * activityStepInterval
						: deploymentSteps[conversation].length * deploymentStepInterval;
			return { ...part, start, end: cursor };
		});
		const end = cursor;
		cursor += 650;
		return { ...turn, start, responseStart, parts, end };
	});
	return { turns: scheduled, duration: Math.max(0, cursor - 650) };
}
export const demoReplays = {
	teable: scheduleTurns('teable', turns.teable),
	nginx: scheduleTurns('nginx', turns.nginx),
	eaglercraft: scheduleTurns('eaglercraft', turns.eaglercraft),
};

export const teableIntroduction = { open: 1800, selected: 4200, end: 6800 };

export const teableApproval = demoReplays.teable.turns
	.flatMap((turn) => turn.parts)
	.find((part) => part.type === 'activity' && part.title === '确认部署');
