import Image from 'next/image';
import { ChevronRightIcon } from '@/assets/icons';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { Icon } from '@/libs/components/ui/icon';
import { getTranslations } from '@/libs/i18n/server';
import { avatarDefault, inviteRocket } from '../assets';
import { GiftBadgeIcon, InviteUsersIcon } from '../components/DesignIcons';
import { FirstLoginGift } from '../components/FirstLoginGift';
import { GiftCard } from '../components/GiftCard';
import type { InvitePreview } from '../utils/invite-preview';
import styles from './HeroSection.module.css';

export async function HeroSection({ preview }: { preview: InvitePreview }) {
	const t = await getTranslations('pages.invite.hero');
	const steps = [
		{
			key: 'verify',
			icon: (
				<InviteUsersIcon
					aria-hidden
					className='size-5 shrink-0'
				/>
			),
		},
		{
			key: 'reward',
			icon: (
				<GiftBadgeIcon
					aria-hidden
					className='size-5 shrink-0'
				/>
			),
		},
		{
			key: 'deploy',
			icon: (
				<Icon
					src={inviteRocket}
					className='size-5 shrink-0'
				/>
			),
		},
	] as const;

	const invalidMessage =
		preview.status === 'not_found' || preview.status === 'disabled' || preview.status === 'unavailable'
			? t(`invalid.${preview.status}`)
			: null;

	return (
		<section className={styles['hero']}>
			<div className={styles['content']}>
				<div className={styles['copy']}>
					<div className='min-h-15.5'>
						{preview.status === 'valid' && (
							<div className='flex items-center gap-2.5 text-lg leading-[1.7] text-neutral-500'>
								<Image
									src={avatarDefault}
									alt=''
									className='size-11.5 shrink-0 rounded-full bg-white object-cover'
								/>
								<div>
									<p>{preview.inviterNickname ?? '***'}</p>
									<p>{t('inviterLine')}</p>
								</div>
							</div>
						)}
					</div>
					<h1 className={styles['title']}>
						{t('titleLine1')}
						<br />
						{t('titleLine2')}
					</h1>
					<p className={styles['subtitle']}>{t('subtitle')}</p>
					<ol className={styles['steps']}>
						{steps.map(({ key, icon }, index) => (
							<li
								key={key}
								className='flex items-center gap-2.5'
							>
								{index > 0 && (
									<Icon
										src={ChevronRightIcon}
										className='hidden size-5 shrink-0 text-neutral-500 sm:block'
									/>
								)}
								{icon}
								<span>{t(`journey.${key}`)}</span>
							</li>
						))}
					</ol>
					{invalidMessage && (
						<output className='block max-w-xl rounded-lg border-hairline border-solid border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
							{invalidMessage}
						</output>
					)}
					<LandingOutlineButton
						href='#download'
						size='lg'
						className='w-90 max-w-full gap-0 p-1.5'
						iconContainerClassName='size-11'
					>
						{t('primaryCta')}
					</LandingOutlineButton>
				</div>
				<div className={styles['reward']}>
					<GiftCard />
				</div>
			</div>
			<FirstLoginGift />
		</section>
	);
}
