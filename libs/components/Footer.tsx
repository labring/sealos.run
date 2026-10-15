import { headers } from 'next/headers';
import Image from 'next/image';
import type React from 'react';
import { FooterHexagonalPattern } from '@/assets';
import { Link } from '@/libs/i18n/navigation';
import { getTranslations } from '@/libs/i18n/server';
import { Logo } from './Logo';

const ICP_FILING = '粤ICP备2023048773号';

function getIcpFiling(host: string | null) {
	const hostname = host
		?.split(',')[0]
		?.trim()
		.split(':')[0]
		?.replace(/^www\./, '')
		.toLowerCase();

	switch (hostname) {
		case 'sealos.run':
		case 'sealos.cn':
			return ICP_FILING;
		case 'localhost':
			return process.env.NODE_ENV === 'development' ? ICP_FILING : undefined;
		default:
			return undefined;
	}
}

export interface MenuLink {
	textI18nKey: string;
	url: string;
}

export interface MenuItem {
	titleI18nKey: string;
	links: MenuLink[];
}

export interface BottomLink {
	textI18nKey: string;
	url: string;
}

export interface SocialLink {
	name: string;
	brandColor: string;
	icon: React.ReactNode;
	url: string;
}

interface FooterConfig {
	titleI18nKey: string;
	taglineI18nKey: string;
	copyrightI18nKey: string;
	menuItems: MenuItem[];
	bottomLinks: BottomLink[];
	socialLinks: SocialLink[];
}

export async function Footer({ config }: { config: FooterConfig }) {
	const t = await getTranslations();
	const requestHeaders = await headers();

	const footerTagline = t(config.taglineI18nKey);
	const footerCopyright = t(config.copyrightI18nKey);
	const icpFiling = getIcpFiling(requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'));
	const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

	// Match the header brand link's px-2 inset inside its px-4 container gutter.
	return (
		<section className='relative container mx-auto pr-4 pb-8 pl-6 text-left'>
			<div className='pointer-events-none absolute right-0 bottom-0 left-0 flex h-96 items-end px-4'>
				<Image
					src={FooterHexagonalPattern}
					alt=''
					role='presentation'
					fill
					className='object-cover object-bottom'
					sizes='100vw'
					style={{
						WebkitMaskImage:
							'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 40%, black 60%, black 100%)',
						WebkitMaskComposite: 'source-in',
						maskImage:
							'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 40%, black 60%, black 100%)',
						maskComposite: 'intersect',
					}}
				/>
			</div>

			<div className='flex flex-col gap-10 lg:flex-row lg:justify-between'>
				<div className='max-w-56 lg:shrink-0'>
					<div className='flex items-center gap-2'>
						<Logo withLogotype />
					</div>
					<p className='mt-2 leading-relaxed text-gray-500'>{footerTagline}</p>
				</div>
				<div className='grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:flex lg:gap-16 xl:gap-24'>
					{config.menuItems.map((section) => (
						<div
							key={section.titleI18nKey}
							className='min-w-0'
						>
							<h3 className='mb-4 leading-none font-medium uppercase'>{t(section.titleI18nKey)}</h3>
							<ul className='space-y-4'>
								{section.links.map((link) => (
									<li
										key={link.textI18nKey}
										className='text-sm leading-normal font-normal hover:underline'
									>
										{isExternalUrl(link.url) ? (
											<a
												href={link.url}
												target='_blank'
											>
												{t(link.textI18nKey)}
											</a>
										) : (
											<Link href={link.url}>{t(link.textI18nKey)}</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
			<div className='mt-24 flex flex-col gap-6 pt-8 text-sm text-gray-500 lg:flex-row lg:items-end lg:justify-between'>
				<div className='min-w-0 space-y-4'>
					<ul className='flex flex-wrap gap-x-4 gap-y-2'>
						{config.bottomLinks.map((link) => (
							<li
								key={link.textI18nKey}
								className='hover:text-primary underline'
							>
								{isExternalUrl(link.url) ? (
									<a
										href={link.url}
										target='_blank'
									>
										{t(link.textI18nKey)}
									</a>
								) : (
									<Link href={link.url}>{t(link.textI18nKey)}</Link>
								)}
							</li>
						))}
					</ul>

					<p className='max-w-full text-xs leading-relaxed'>
						<span className='block sm:inline'>{footerCopyright}</span>
						{icpFiling ? (
							<>
								<span aria-hidden='true'> · </span>
								<a
									href='https://beian.miit.gov.cn/'
									target='_blank'
									rel='noopener noreferrer'
									className='whitespace-nowrap hover:text-primary hover:underline'
								>
									{icpFiling}
								</a>
							</>
						) : null}
					</p>
				</div>
				<ul className='flex shrink-0 gap-8'>
					{config.socialLinks.map((link) => (
						<a
							key={link.name}
							href={link.url}
							target='_blank'
						>
							<li
								className='not-hover:text-foreground size-5 hover:text-(--brand-color)'
								style={{ '--brand-color': link.brandColor }}
							>
								<div className='h-full w-full'>{link.icon}</div>
							</li>
						</a>
					))}
				</ul>
			</div>
		</section>
	);
}
