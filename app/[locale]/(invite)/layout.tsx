import { Geist } from 'next/font/google';
import { Footer, type MenuItem } from '@/libs/components/Footer';
import { Config } from '@/libs/config';
import { footerPattern } from './invite/[code]/assets';
import { InviteNavbar } from './invite/[code]/components/InviteNavbar';

const geist = Geist({ subsets: ['latin'], display: 'swap' });

const menuItems = [
	{
		titleI18nKey: 'pages.invite.footer.products',
		links: [
			{ textI18nKey: 'pages.invite.footer.fastgpt', url: 'https://fastgpt.cn' },
			{ textI18nKey: 'components.footer.menuItems.products.links.devbox', url: '/products/devbox' },
			{ textI18nKey: 'pages.invite.footer.aiproxy', url: '/products/aiproxy' },
		],
	},
	{
		titleI18nKey: 'pages.invite.footer.shortcuts',
		links: [
			{ textI18nKey: 'pages.invite.footer.business', url: Config.components.navbar.contactButtonLink },
			{ textI18nKey: 'pages.invite.footer.sales', url: '/solutions' },
			{ textI18nKey: 'pages.invite.footer.docs', url: '/docs' },
		],
	},
	{
		titleI18nKey: 'pages.invite.footer.contact',
		links: [
			{ textI18nKey: 'pages.invite.footer.cases', url: '/solutions' },
			{ textI18nKey: 'pages.invite.footer.blog', url: '/blog' },
			{ textI18nKey: 'pages.invite.footer.community', url: 'https://github.com/labring/sealos/discussions' },
			{ textI18nKey: 'pages.invite.footer.feedback', url: 'https://github.com/labring/sealos/issues' },
		],
	},
] satisfies MenuItem[];

export default function InviteLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={geist.className}>
			<header className='sticky top-0 z-50 border-b border-zinc-200 bg-background'>
				<InviteNavbar />
			</header>
			<main className='relative'>{children}</main>
			<footer className='pt-16 sm:pt-24 md:pt-36'>
				<Footer
					config={{ ...Config.components.footer, menuItems }}
					variant='invite'
					pattern={footerPattern}
				/>
			</footer>
		</div>
	);
}
