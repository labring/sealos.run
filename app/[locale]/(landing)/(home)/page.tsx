import type { Metadata } from 'next';
import { ArchitectureBoxIcon, FramedCheckIcon, MoreIcon, SealosBoxIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { VerticalDashedLine } from '@/libs/components/VerticalDashedLine';
import { DesktopAnnouncement } from './components/DesktopAnnouncement';
import { FeaturesSectionWrapper } from './components/FeaturesSectionWrapper';
import { ArchSection } from './sections/ArchSection';
import { CTASection } from './sections/CTASection';
import { ExamplesSection } from './sections/ExamplesSection';
import { HeroSection } from './sections/HeroSection';
import { OrgsSection } from './sections/OrgsSection';
import { PrivateDeploySection } from './sections/PrivateDeploySection';
import { SecuritySection } from './sections/SecuritySection';

const SITE_URL = 'https://sealos.run';
const SITE_NAME = 'Sealos';
const TITLE = 'Sealos | 应用为中心的智能云操作系统';
const DESCRIPTION =
	'Sealos 是应用为中心的智能云操作系统，一键部署数据库、AI 应用与企业级服务，免配置、免运维，按量付费。应用商店、DevBox 云开发、对象存储、AI Proxy 一站式搞定，让团队专注业务而非基础设施。';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: TITLE,
	description: DESCRIPTION,
	keywords: [
		'Sealos',
		'云操作系统',
		'云原生',
		'Kubernetes',
		'应用部署',
		'云开发环境',
		'DevBox',
		'数据库托管',
		'对象存储',
		'AI Proxy',
		'Serverless',
		'私有云',
	],
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		siteName: SITE_NAME,
		url: SITE_URL,
		title: TITLE,
		description: DESCRIPTION,
		locale: 'zh_CN',
	},
	twitter: {
		card: 'summary_large_image',
		site: '@Sealos_io',
		title: TITLE,
		description: DESCRIPTION,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			'@id': `${SITE_URL}/#organization`,
			name: SITE_NAME,
			url: SITE_URL,
			logo: `${SITE_URL}/favicon/favicon-96x96.png`,
			description: DESCRIPTION,
			sameAs: [
				'https://github.com/labring/sealos',
				'https://x.com/Sealos_io',
				'https://discord.gg/wdUn538zVP',
				'https://www.youtube.com/@sealos_io',
			],
		},
		{
			'@type': 'WebSite',
			'@id': `${SITE_URL}/#website`,
			url: SITE_URL,
			name: TITLE,
			description: DESCRIPTION,
			inLanguage: 'zh-CN',
			publisher: { '@id': `${SITE_URL}/#organization` },
		},
		{
			'@type': 'SoftwareApplication',
			name: SITE_NAME,
			applicationCategory: 'DeveloperApplication',
			operatingSystem: 'Cloud',
			url: SITE_URL,
			description: DESCRIPTION,
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'CNY',
				description: '按量付费，免费开始',
			},
			publisher: { '@id': `${SITE_URL}/#organization` },
		},
	],
};

export default async function HomePage() {
	return (
		<div className='flex w-full flex-col'>
			<DesktopAnnouncement />
			<script
				type='application/ld+json'
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires raw HTML injection
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<section>
				<HeroSection />
			</section>

			<section className='container mx-auto px-6 pt-7 pb-12 sm:pb-28'>
				<OrgsSection />
			</section>

			<section className='relative container mx-auto pr-6 pb-32 pl-16 sm:pl-24'>
				<VerticalDashedLine
					enableScrollAnimation
					mask={[['0rem', '1.75rem']]}
					className='w-6 [--icon-size:1.5rem] sm:w-12 sm:[--icon-scale-base:2]'
				>
					<Icon
						src={SealosBoxIcon}
						className='size-full'
					/>
				</VerticalDashedLine>

				<ExamplesSection />
			</section>

			<section className='relative container mx-auto h-340 pr-6 pb-28 pl-16 sm:h-300 sm:pl-32 lg:h-240 xl:h-188'>
				<FeaturesSectionWrapper />
			</section>

			<section className='relative container mx-auto pr-6 pb-28 pl-16 sm:pl-24'>
				<VerticalDashedLine
					enableScrollAnimation
					mask={[['0.3rem', '1.25rem']]}
					className='w-6 [--icon-size:1.5rem] sm:w-12 sm:[--icon-scale-base:2]'
				>
					<Icon
						src={ArchitectureBoxIcon}
						className='size-full'
					/>
				</VerticalDashedLine>

				<ArchSection />
			</section>

			<section className='relative container mx-auto pr-6 pb-28 pl-16 sm:pl-24'>
				<VerticalDashedLine
					enableScrollAnimation
					mask={[['0.275rem', '1.625rem']]}
					className='w-6 [--icon-size:1.5rem] sm:w-12 sm:[--icon-scale-base:2]'
				>
					<Icon
						src={FramedCheckIcon}
						className='size-full'
					/>
				</VerticalDashedLine>

				<SecuritySection />
			</section>

			<section className='relative container mx-auto pr-6 pb-16 pl-16 sm:pl-24'>
				<VerticalDashedLine
					enableScrollAnimation
					mask={[['0rem', '1.875rem']]}
					className='w-6 [--icon-size:1.5rem] sm:w-12 sm:[--icon-scale-base:2]'
				>
					<Icon
						src={MoreIcon}
						className='size-full'
					/>
				</VerticalDashedLine>

				<PrivateDeploySection />
			</section>

			<section className='flex w-full flex-col items-center bg-zinc-100 py-12'>
				<div className='container mx-auto px-6'>
					<CTASection />
				</div>
			</section>
		</div>
	);
}
