// Fixed content from the user's two App examples. Never include the real RCON credential.
export const demoConversations = {
	nginx: {
		project: 'Nginx Web Server',
		title: 'Creating an nginx project',
		prompt: '帮我创建一个 nginx 项目',
		service: 'nginx',
		image: 'nginx:stable',
		url: 'https://yfjfjoffmktq.sealosbja.site',
	},
	eaglercraft: {
		project: 'eaglercraft-server-tvbxdlaa',
		title: '请自动补齐这个模板方案的所有参数，包括用户名、密码和 API Key。使用真实可用的凭据来源；只准备方案，暂不部署。',
		prompt: '请自动补齐这个模板方案的所有参数，包括用户名、密码和 API Key。使用真实可用的凭据来源；只准备方案，暂不部署。',
		service: 'eaglercraft-server-tvbxdlaa',
		image: 'ghcr.io/yangchuansheng/eaglerx1.8server:2.2.7@sha256:56ad224a996030b7bfb2837702f065fe88685eda511d7a186812f22dc5cad047',
		url: 'https://eaglercraft-cqaypzur.sealosbja.site',
	},
};
export type DemoConversationId = keyof typeof demoConversations;
