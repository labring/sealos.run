import React from 'react';
import { getTranslations } from '@/libs/i18n/server';
import { GiftBadgeIcon } from './DesignIcons';
import styles from './GiftCard.module.css';
import { GiftCardMotion } from './GiftCardMotion';

// Ticket silhouette from Paper, including the two notches at the perforation.
const TICKET_PATH =
	'M499 0C506.732 0 513 6.268 513 14V167C513 174.732 506.732 181 499 181H339.987C339.727 175.709 335.355 171.5 330 171.5C324.645 171.5 320.273 175.709 320.013 181H14C6.268 181 0 174.732 0 167V14C0 6.268 6.268 0 14 0H320.013C320.005 0.166 320 0.332 320 0.5C320 6.023 324.477 10.5 330 10.5C335.523 10.5 340 6.023 340 0.5C340 0.332 339.995 0.166 339.987 0H499Z';

function TicketShape({ back = false }: { back?: boolean }) {
	const gradientId = React.useId();

	return (
		<svg
			aria-hidden='true'
			viewBox='0 0 513 181'
			preserveAspectRatio='none'
			className={styles['shape']}
		>
			<defs>
				<linearGradient
					id={gradientId}
					x1='0'
					y1='0'
					x2='1'
					y2='1'
				>
					<stop
						offset='0'
						stopColor='#ffffff'
					/>
					<stop
						offset='1'
						stopColor='#f3f8ff'
					/>
				</linearGradient>
			</defs>
			<path
				d={TICKET_PATH}
				fill={back ? '#171717' : `url(#${gradientId})`}
				stroke={back ? '#171717' : '#dce3ed'}
				strokeWidth='1'
				vectorEffect='non-scaling-stroke'
			/>
			<path
				d='M330 20V161'
				fill='none'
				stroke='#94a3b8'
				strokeOpacity='0.5'
				strokeDasharray='4 5'
				vectorEffect='non-scaling-stroke'
			/>
		</svg>
	);
}

export async function GiftCard() {
	const t = await getTranslations('pages.invite.giftCard');

	return (
		<GiftCardMotion back={<TicketShape back />}>
			<div className={styles['ticket']}>
				<TicketShape />
				<div className={styles['details']}>
					<div className={styles['giftLabel']}>
						<GiftBadgeIcon
							aria-hidden='true'
							className='size-4 shrink-0'
						/>
						<p>{t('eyebrow')}</p>
					</div>
					<div className='space-y-3'>
						<p className='text-xl leading-snug font-medium sm:text-2xl'>{t('title')}</p>
						<p className='text-muted-foreground text-xs leading-relaxed sm:text-sm'>{t('description')}</p>
					</div>
				</div>
				<div className={styles['value']}>
					<GiftBadgeIcon
						aria-hidden='true'
						className='mb-4 size-5 text-blue-400'
					/>
					<p className='text-5xl leading-none font-semibold tracking-tight sm:text-6xl'>{t('amount')}</p>
					<p className='mt-3 text-center text-xs text-muted-foreground'>{t('validity')}</p>
					<div
						aria-hidden='true'
						className={styles['barcode']}
					/>
				</div>
			</div>
		</GiftCardMotion>
	);
}
