// Fixed content from the supplied App examples. Never include credentials.
export const demoConversations = {
	teable: {
		project: 'teable',
		deployment: {
			label: '本地代码上线 · teable',
			complete: 'teable 部署完成',
			pending: '正在部署',
			time: '2 分 10 秒',
		},
		title: '本地代码上线 · teable',
		prompt: '帮我把这个目录（你的工作区）里的源码部署到 Sealos 上',
		service: 'teable-qmygpgcc-teable',
		image: 'teable:20261023-053035',
		url: 'https://teable-mfkvkzxp.bja.sealos.run',
	},
	nginx: {
		project: 'Nginx Web Server',
		deployment: {
			label: '部署 project-facd43c0473641c0a3d942277c83737b',
			complete: '部署完成',
			pending: '正在部署',
			time: '13 秒',
		},
		title: '部署应用 · Nginx',
		prompt: '帮我创建一个 nginx 项目',
		service: 'nginx',
		image: 'nginx:stable',
		url: 'https://yfjfjoffmktq.sealosbja.site',
	},
	eaglercraft: {
		project: 'eaglercraft-server-tvbxdlaa',
		deployment: {
			label: '模板部署 · eaglercraft-server-tvbxdlaa',
			complete: 'eaglercraft-server 部署完成',
			pending: 'eaglercraft-server 部署中',
			time: '3 分 27 秒',
		},
		title: '部署模板 · Eaglercraft',
		prompt: '请自动补齐这个模板方案的所有参数，包括用户名、密码和 API Key。使用真实可用的凭据来源；只准备方案，暂不部署。',
		service: 'eaglercraft-server-tvbxdlaa',
		image: 'ghcr.io/yangchuansheng/eaglerx1.8server:2.2.7@sha256:56ad224a996030b7bfb2837702f065fe88685eda511d7a186812f22dc5cad047',
		url: 'https://eaglercraft-cqaypzur.sealosbja.site',
	},
};
export type DemoConversationId = keyof typeof demoConversations;
