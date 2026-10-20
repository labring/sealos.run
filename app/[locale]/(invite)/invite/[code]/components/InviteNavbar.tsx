import { Logo } from '@/libs/components/Logo';
import { NavbarActions } from '@/libs/components/Navbar/NavbarActions';
import { NavbarBrand } from '@/libs/components/Navbar/NavbarBrand';
import { NavbarClient } from '@/libs/components/Navbar/NavbarClient';
import { NavbarContainer } from '@/libs/components/Navbar/NavbarContainer';
import { NavbarMobileNav } from '@/libs/components/Navbar/NavbarMobileNav';
import { Config } from '@/libs/config';
import { getTranslations } from '@/libs/i18n/server';

export async function InviteNavbar() {
	const t = await getTranslations();
	const links = [
		...Config.components.navbar.links.filter((link) => link.panel),
		{ textI18nKey: 'pages.invite.navbar.download', href: '/downloads' },
		{ textI18nKey: 'components.navbar.links.solutions', href: '/solutions' },
		{ textI18nKey: 'components.navbar.links.pricing', href: '/pricing/payg' },
		{ textI18nKey: 'components.navbar.links.docs', href: '/docs' },
		{ textI18nKey: 'pages.invite.navbar.marketplace', href: '/products/appstore' },
		{ textI18nKey: 'components.navbar.links.about-us', href: '/about-us' },
	];
	const actions = {
		contactLabel: t('components.navbar.buttons.contact'),
		contactFormConfig: Config.pages.solutions.contactForm,
		signinHref: Config.components.navbar.signinLink,
		signinLabel: t('components.navbar.buttons.signin'),
	};

	return (
		<NavbarContainer>
			<div className='mx-auto flex h-16 w-full max-w-332 items-center justify-between px-6 xl:grid xl:h-17.5 xl:grid-cols-[1fr_auto_1fr]'>
				<div className='[&_a]:p-0'>
					<NavbarBrand>
						<Logo
							withLogotype
							className={{ wrapper: 'h-7', image: 'size-7', text: 'font-bold' }}
						/>
					</NavbarBrand>
				</div>
				<div className='hidden xl:block'>
					<NavbarClient
						links={links}
						headerHeight={70}
						desktopBreakpoint='xl'
						className='[&_ul]:gap-12.5 [&_li>a]:px-0 [&_li>button]:px-0'
					/>
				</div>
				<div className='justify-self-end'>
					<div className='hidden xl:block [&_a]:h-9 [&_button]:h-9 [&_button]:min-w-26 [&_button]:px-3 [&_svg]:size-4 [&_ul]:gap-4'>
						<NavbarActions {...actions} />
					</div>
					<div className='xl:hidden'>
						<NavbarMobileNav
							links={links}
							{...actions}
						/>
					</div>
				</div>
			</div>
		</NavbarContainer>
	);
}
