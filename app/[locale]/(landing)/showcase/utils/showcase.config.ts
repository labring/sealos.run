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
	{ level: 'Lv.2 热门', amount: '+¥188', requirement: { deep: '1w 阅读 · 100 互动', short: '2w 播放 · 100 互动' } },
	{ level: 'Lv.3 爆款', amount: '+¥588', requirement: { deep: '3w 阅读 · 300 互动', short: '6w 播放 · 300 互动' } },
	{
		level: 'Lv.4 破圈',
		amount: '+¥1,888',
		requirement: { deep: '10w 阅读 · 1,000 互动', short: '20w 播放 · 1,000 互动' },
		top: true,
	},
];

export const showcaseLinks: { download: string; submitForm: string | null } = {
	download: '/downloads',
	submitForm: 'https://fael3z0zfze.feishu.cn/share/base/form/shrcnuNRrA8AR75un8f9dss5O6f',
};
