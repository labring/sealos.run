import { getTranslations } from '@/libs/i18n/server';
import { GiftBadgeIcon } from './DesignIcons';

/**
 * The ¥5 gift card from the design spec: a straight front card sitting over a
 * twin card rotated 7deg and nudged down behind it, warm drop shadow, dashed
 * divider. Padding reserves room so the rotated twin is never clipped.
 */
export async function GiftCard() {
	const t = await getTranslations('pages.invite.giftCard');

	return (
		<div className='relative mx-auto w-full max-w-[513px] px-5 pt-8 pb-20 lg:mx-0'>
			<div
				aria-hidden
				className='border-zinc-200 absolute inset-x-5 top-20 bottom-8 rotate-[8deg] rounded-[14px] border bg-white'
				style={{
					backgroundImage:
						'linear-gradient(to top left in oklab, rgba(10, 163, 249, 0.1), rgba(181, 180, 255, 0.1))',
				}}
			/>
			<div className='border-zinc-200 bg-card relative flex flex-col gap-6 rounded-[14px] border px-5 py-4 shadow-[4px_4px_16px_rgba(255,251,218,0.4)] sm:flex-row'>
				<div className='flex min-w-0 flex-1 flex-col justify-between gap-6 py-1'>
					<div className='flex items-center gap-2'>
						<GiftBadgeIcon className='text-zinc-950 size-5 shrink-0' />
						<p className='text-zinc-950 text-xs'>{t('eyebrow')}</p>
					</div>
					<div className='flex flex-col gap-3'>
						<p className='text-2xl font-medium'>{t('title')}</p>
						<p className='text-muted-foreground text-sm text-pretty'>{t('description')}</p>
					</div>
				</div>
				<div className='border-zinc-900/30 flex w-full shrink-0 flex-col items-center justify-center gap-1 border-t border-dashed pt-4 sm:w-[168px] sm:border-t-0 sm:border-l sm:border-dashed sm:pt-0 sm:pl-5'>
					<p className='text-5xl font-semibold'>{t('amount')}</p>
					<p className='text-zinc-950 text-xs'>{t('validity')}</p>
				</div>
			</div>
		</div>
	);
}
