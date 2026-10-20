import { siGithub } from 'simple-icons';
import { Button } from '@/libs/components/ui/button';
import { SimpleIcon } from '@/libs/components/ui/simple-icon';
import { Config } from '@/libs/config';
import { getGitHubRepositoryStats } from '@/libs/github-metadata/utils';
import { getTranslations } from '@/libs/i18n/server';
import { Logo } from '../Logo';
import { NavbarActions } from './NavbarActions';
import { NavbarBrand } from './NavbarBrand';
import { NavbarClient } from './NavbarClient';
import { NavbarContainer } from './NavbarContainer';
import { NavbarMobileNav } from './NavbarMobileNav';

const SEALOS_GITHUB_REPO = 'labring/sealos';

async function getSealosStarsCount() {
	try {
		const response = await fetch(`https://api.github.com/repos/${SEALOS_GITHUB_REPO}`, {
			next: { revalidate: 86400 },
			signal: AbortSignal.timeout(3000),
		});
		if (response.ok) {
			const data: unknown = await response.json();
			if (
				data &&
				typeof data === 'object' &&
				'stargazers_count' in data &&
				typeof data.stargazers_count === 'number' &&
				Number.isFinite(data.stargazers_count) &&
				data.stargazers_count >= 0
			) {
				return data.stargazers_count;
			}
		}
	} catch {
		// Keep the verified count visible when GitHub is unavailable or rate limited.
	}
	return getGitHubRepositoryStats(SEALOS_GITHUB_REPO)?.starsCount ?? 18373; // Verified 2026-10-20.
}

export async function Navbar() {
	const t = await getTranslations();
	const stats = getGitHubRepositoryStats(SEALOS_GITHUB_REPO);
	const githubUrl = stats?.htmlUrl ?? `https://github.com/${SEALOS_GITHUB_REPO}`;
	const starsCount = await getSealosStarsCount();
	const starsText = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	})
		.format(starsCount)
		.replace(/([KMB])$/, ' $1');

	return (
		<NavbarContainer>
			<div className='container mx-auto flex h-16 items-center justify-between px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]'>
				{/* Brand */}
				<NavbarBrand>
					<Logo withLogotype />
				</NavbarBrand>

				{/* Links */}
				<div className='mx-auto hidden lg:block'>
					<div className='items-center gap-12 lg:flex'>
						<NavbarClient links={Config.components.navbar.links} />
					</div>
				</div>

				{/* Actions */}
				<div className='flex items-center justify-end gap-1'>
					<Button
						asChild
						variant='ghost'
						className='h-10 gap-1 px-2'
					>
						<a
							href={githubUrl}
							target='_blank'
							rel='noreferrer'
							aria-label={`在 GitHub 查看 ${SEALOS_GITHUB_REPO}，当前 Star ${starsCount}`}
						>
							<span className='text-sm leading-none'>{starsText}</span>
							<SimpleIcon
								d={siGithub.path}
								className='size-6'
							/>
						</a>
					</Button>
					<div className='hidden lg:flex'>
						<NavbarActions
							contactLabel={t('components.navbar.buttons.contact')}
							contactFormConfig={Config.pages.solutions.contactForm}
							signinHref={Config.components.navbar.signinLink}
							signinLabel={t('components.navbar.buttons.signin')}
						/>
					</div>
					<div className='lg:hidden'>
						<NavbarMobileNav
							links={Config.components.navbar.links}
							contactLabel={t('components.navbar.buttons.contact')}
							contactFormConfig={Config.pages.solutions.contactForm}
							signinHref={Config.components.navbar.signinLink}
							signinLabel={t('components.navbar.buttons.signin')}
						/>
					</div>
				</div>
			</div>
		</NavbarContainer>
	);
}
