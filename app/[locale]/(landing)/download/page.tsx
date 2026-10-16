import type { Metadata } from 'next';
import { DownloadContent } from './sections/DownloadContent';

const title = '下载 Sealos Desktop — 让 Agent 负责上线与运维';
const description =
	'Sealos Desktop 是专注业务上线与持续运维的专用 Agent。连接本地代码与云端资源，用自然语言完成部署、依赖创建与故障排查。';

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: '/download' },
	openGraph: { title, description, url: 'https://sealos.run/download', locale: 'zh_CN', type: 'website' },
};

export default function DownloadPage() {
	return <DownloadContent />;
}
