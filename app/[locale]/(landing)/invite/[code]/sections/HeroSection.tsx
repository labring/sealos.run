import Image from 'next/image';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { getTranslations } from '@/libs/i18n/server';
import { avatarDefault } from '../assets';
import { GiftCard } from '../components/GiftCard';
import { consoleInviteUrl } from '../utils/invite.config';
import type { InvitePreview } from '../utils/invite-preview';

export async function HeroSection({ code, preview }: { code: string; preview: InvitePreview }) {
	const t = await getTranslations('pages.invite.hero');

	const invalidMessage =
		preview.status === 'not_found' || preview.status === 'disabled' || preview.status === 'unavailable'
			? t(`invalid.${preview.status}`)
			: null;

	return (
		<section className='container mx-auto px-6 pt-24 pb-16 sm:pt-28 lg:pb-24'>
			<div className='flex flex-col items-center gap-14 xl:flex-row xl:items-start xl:justify-between xl:gap-8'>
				<div className='flex w-full min-w-0 max-w-2xl flex-col items-center gap-8 text-center xl:items-start xl:text-left'>
					{preview.status === 'valid' && (
						<div className='flex items-center gap-2.5'>
							<span className='bg-white size-12 overflow-hidden rounded-full'>
								<Image
									src={avatarDefault}
									alt=''
									className='size-full object-cover'
								/>
							</span>
							<div className='text-neutral-500 flex flex-col text-lg leading-[1.7]'>
								<span>{preview.inviterNickname ?? '***'}</span>
								<span>{t('inviterLine')}</span>
							</div>
						</div>
					)}

					<h1 className='text-4xl leading-snug font-semibold text-balance sm:text-5xl lg:text-[56px] lg:leading-snug'>
						{t('titleLine1')}
						<br />
						{t('titleLine2')}
					</h1>

					<p className='text-muted-foreground text-lg leading-7 text-pretty'>{t('subtitle')}</p>

					{invalidMessage && (
						<output className='border-destructive/30 bg-destructive/5 text-destructive max-w-xl border-hairline block rounded-lg border-solid px-4 py-3 text-sm'>
							{invalidMessage}
						</output>
					)}

					<LandingOutlineButton
						href={consoleInviteUrl(code)}
						size='lg'
					>
						{t('primaryCta')}
					</LandingOutlineButton>
				</div>

				<div className='w-full xl:w-[553px] xl:shrink-0'>
					<GiftCard />
				</div>
			</div>
		</section>
	);
}
