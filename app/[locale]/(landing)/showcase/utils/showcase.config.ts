import type { StaticImageData } from 'next/image';
import { projectCovers } from '../assets';

export type ShowcaseProject = {
	id: string;
	name: string;
	summary: string;
	/** Public address of the project running on Sealos. */
	url: string;
	/** Screenshot of the product, 3:2. */
	cover: StaticImageData;
	author: string;
	avatar: string;
	role: string;
	platform: string;
	reach: string;
	/** Link to the creator's social post; the "看原帖" button is hidden while null. */
	postUrl: string | null;
	prompt: string;
	highlights: readonly { title: string; detail: string }[];
};

// TODO(待确认): 以下 6 个作品是 UI 原型里的示例数据（项目、作者、阅读量、线上地址均为虚构），
// 封面图是 AI 生成的示意界面。上线前必须整体替换为真实入选项目：补全 url 与 postUrl，
// 并把 assets/ 下的封面换成各项目的真实截图（3:2，建议 1200×800 的 webp）。
export const showcaseProjects: readonly ShowcaseProject[] = [
	{
		id: 'photoflow',
		cover: projectCovers.photoflow,
		name: 'PhotoFlow 智能修图台',
		summary: '独立摄影师批量精修与原图云端直传选片工具。',
		url: 'https://photoflow.sealos.run',
		author: '林深',
		avatar: '林',
		role: '独立开发者',
		platform: '小红书',
		reach: '2.4w 阅读',
		postUrl: null,
		prompt: '把本地修图项目上线，自动开通对象存储桶存客片原图、接入 AI 网关并绑定公网域名。',
		highlights: [
			{ title: '批量精修台', detail: '0.8 秒/张极速出片' },
			{ title: '原图云直传', detail: '一键生成选片页' },
			{ title: '公网稳运行', detail: '服务 310 位摄影师' },
		],
	},
	{
		id: 'askrepo',
		cover: projectCovers.askrepo,
		name: 'AskRepo 代码库秒懂助手',
		summary: '输入 GitHub 地址，自动生成架构图并追问调用链。',
		url: 'https://askrepo.sealos.run',
		author: '阿泽',
		avatar: '泽',
		role: '全栈工程师',
		platform: 'B站',
		reach: '3.1w 播放',
		postUrl: null,
		prompt: '一键拉起带 pgvector 向量插件的 PostgreSQL，配置大模型网关并发布线上服务。',
		highlights: [
			{ title: '模块拓扑图', detail: '秒级定位核心入口' },
			{ title: '向量语义搜', detail: '跨文件追踪调用链' },
			{ title: '免登录即用', detail: '解析 1,240 个仓库' },
		],
	},
	{
		id: 'voicecard',
		cover: projectCovers.voicecard,
		name: 'VoiceCard 播客金句卡',
		summary: '粘贴播客单集链接，12 秒提取高光金句生成分享卡。',
		url: 'https://voicecard.sealos.run',
		author: 'Mia',
		avatar: 'M',
		role: '播客主理人',
		platform: '小红书',
		reach: '1.2w 阅读',
		postUrl: null,
		prompt: '将 Cursor 写好的播客解析工具打包上线，自动挂载 Redis 转写队列与持久化存储。',
		highlights: [
			{ title: '高光金句抓', detail: '12 秒提取核心段落' },
			{ title: '声波分享卡', detail: '一键导出高清长图' },
			{ title: '异步快队列', detail: '峰值并发零卡顿' },
		],
	},
	{
		id: 'formpilot',
		cover: projectCovers.formpilot,
		name: 'FormPilot 车间巡检快表',
		summary: '拍照识设备铭牌自动建档，异常工单秒推企业微信。',
		url: 'https://formpilot.sealos.run',
		author: '老周',
		avatar: '周',
		role: '数字化顾问',
		platform: '公众号',
		reach: '5,600 阅读',
		postUrl: null,
		prompt: '对话生成手机端扫码巡检表单，自动初始化 PostgreSQL 表结构与企微机器人告警。',
		highlights: [
			{ title: '铭牌拍照建档', detail: '告别纸质手抄台账' },
			{ title: '异常秒推企微', detail: '超时自动升级提醒' },
			{ title: '数据自动备份', detail: '已稳定运行 23 天' },
		],
	},
	{
		id: 'tarot',
		cover: projectCovers.tarot,
		name: 'TarotNote 每日行动签',
		summary: '零后端基础对话直出，每日抽取 3 条最小可行行动建议。',
		url: 'https://tarotnote.sealos.run',
		author: '星夜',
		avatar: '星',
		role: '产品设计师',
		platform: '小红书',
		reach: '4,800 阅读',
		postUrl: null,
		prompt: '全程在 Sealos Desktop 对话生成前后端并自动注入 AI 网关，10 分钟拿到公网链接。',
		highlights: [
			{ title: '丝滑翻牌动效', detail: '完美适配手机端' },
			{ title: 'AI 行动建议', detail: '流式秒回零延迟' },
			{ title: '日签卡片分享', detail: '累计生成 2,800 张' },
		],
	},
	{
		id: 'snapbill',
		cover: projectCovers.snapbill,
		name: 'SnapBill 独立接单报价单',
		summary: '30 秒生成带甲方在线签字确认与收款提醒的接单页。',
		url: 'https://snapbill.sealos.run',
		author: '言午',
		avatar: '言',
		role: '独立设计师',
		platform: '知乎',
		reach: '3,600 阅读',
		postUrl: null,
		prompt: '本地前端写完丢给桌面端，3 分钟自动跑通 PostgreSQL 数据库与正式 HTTPS 域名。',
		highlights: [
			{ title: '清晰报价清单', detail: '支持多币种切换' },
			{ title: '甲方在线签字', detail: '一键导出正式 PDF' },
			{ title: '首款进度追踪', detail: '已确认 ¥18.6w 订单' },
		],
	},
];

export const showcaseProjectIds = showcaseProjects.map((project) => project.id);

export const bountyTracks = [
	{ id: 'deep', label: '小红书 / B站 / 公众号 / 知乎' },
	{ id: 'short', label: '抖音 / 视频号 / X' },
] as const;

export type BountyTrack = (typeof bountyTracks)[number]['id'];

export const bountyTiers: readonly {
	level: string;
	amount: string;
	requirement: Record<BountyTrack, string>;
	top?: boolean;
}[] = [
	{ level: '首作保底', amount: '¥20', requirement: { deep: '发帖满 7 天即领', short: '发帖满 7 天即领' } },
	{
		level: 'Lv.1 新星',
		amount: '+¥58',
		requirement: { deep: '3,000 阅读 · 30 互动', short: '6,000 播放 · 30 互动' },
	},
	{
		level: 'Lv.2 热门',
		amount: '+¥188',
		requirement: { deep: '1w 阅读 · 100 互动', short: '2w 播放 · 100 互动' },
	},
	{
		level: 'Lv.3 爆款',
		amount: '+¥588',
		requirement: { deep: '3w 阅读 · 300 互动', short: '6w 播放 · 300 互动' },
	},
	{
		level: 'Lv.4 破圈',
		amount: '+¥1,888',
		requirement: { deep: '10w 阅读 · 1,000 互动', short: '20w 播放 · 1,000 互动' },
		top: true,
	},
];

export const showcaseLinks: { download: string; submitForm: string | null } = {
	download: '/downloads',
	// TODO(待确认): 填入飞书投稿表单链接。为 null 时页面不显示「提交作品」按钮。
	submitForm: null,
};
