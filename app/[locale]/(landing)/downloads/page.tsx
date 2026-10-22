import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { DownloadContent } from './sections/DownloadContent';

const geist = Geist({ subsets: ['latin'], display: 'swap' });

const title = '下载 Sealos Desktop — 让 Agent 负责上线与运维';
const description =
	'Sealos Desktop 是专注业务上线与持续运维的专用 Agent。连接本地代码与云端资源，用自然语言完成部署、依赖创建与故障排查。';

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: '/downloads' },
	openGraph: { title, description, url: 'https://sealos.run/downloads', locale: 'zh_CN', type: 'website' },
};

export default function DownloadPage() {
	return (
		<div className={geist.className}>
			<DownloadContent />
		</div>
	);
}
