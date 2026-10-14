import { Logo } from '@/libs/components/Logo';
import { Badge } from '@/libs/components/ui/badge';
import { Button } from '@/libs/components/ui/button';
import { getTranslations } from '@/libs/i18n/server';
import { consoleInviteUrl } from '../utils/invite.config';
import type { InvitePreview } from '../utils/invite-preview';

export async function HeroSection({ code, preview }: { code: string; preview: InvitePreview }) {
	const t = await getTranslations('pages.invite.hero');

	const invalidMessage =
		preview.status === 'not_found' || preview.status === 'disabled' || preview.status === 'unavailable'
			? t(`invalid.${preview.status}`)
			: null;

	return (
		<section className='container mx-auto flex flex-col items-center gap-6 px-6 pt-16 pb-12 text-center sm:pt-24'>
			<Badge variant='outline'>{t('badge')}</Badge>

			<Logo withLogotype />

			<div className='flex max-w-2xl flex-col gap-4'>
				<h1 className='text-3xl leading-tight font-semibold text-balance sm:text-4xl'>
					{preview.status === 'valid' && preview.inviterNickname
						? t('titleFromInviter', { inviter: preview.inviterNickname })
						: t('title')}
				</h1>
				<p className='text-base text-muted-foreground text-pretty sm:text-lg'>{t('subtitle')}</p>
			</div>

			{invalidMessage && (
				<output className='border-destructive/30 bg-destructive/5 text-destructive max-w-xl border-hairline block rounded-lg border-solid px-4 py-3 text-sm'>
					{invalidMessage}
				</output>
			)}

			<div className='flex flex-col items-center gap-3 sm:flex-row'>
				<Button
					asChild
					size='lg'
					className='h-12 px-8 text-base'
				>
					<a href={consoleInviteUrl(code)}>{t('primaryCta')}</a>
				</Button>
				<Button
					asChild
					variant='outline'
					size='lg'
					className='h-12 px-8 text-base'
				>
					<a href='#download'>{t('secondaryCta')}</a>
				</Button>
			</div>

			<div className='grid w-full max-w-xl gap-4 pt-4 sm:grid-cols-2'>
				<div className='bg-card border-hairline flex flex-col gap-1 rounded-lg border border-solid p-6'>
					<p className='text-muted-foreground text-sm'>{t('inviteeRewardLabel')}</p>
					<p className='text-brand text-3xl font-semibold'>{t('inviteeRewardValue')}</p>
					<p className='text-muted-foreground text-sm'>{t('inviteeRewardDetail')}</p>
				</div>
				<div className='bg-card border-hairline flex flex-col gap-1 rounded-lg border border-solid p-6'>
					<p className='text-muted-foreground text-sm'>{t('inviterRewardLabel')}</p>
					<p className='text-brand text-3xl font-semibold'>{t('inviterRewardValue')}</p>
					<p className='text-muted-foreground text-sm'>{t('inviterRewardDetail')}</p>
				</div>
			</div>
		</section>
	);
}
