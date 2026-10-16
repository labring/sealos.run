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
					x1='1.15'
					y1='1.03'
					x2='0.47'
					y2='-0.03'
				>
					<stop
						offset='0'
						stopColor='#eaf6fe'
					/>
					<stop
						offset='1'
						stopColor='#f8f8ff'
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
							className='size-5 shrink-0'
						/>
						<p>{t('eyebrow')}</p>
					</div>
					<div className='space-y-5'>
						<p className='text-lg leading-6 font-medium whitespace-pre-line sm:text-2xl sm:leading-7'>
							{t('title')}
						</p>
						<p className='text-xs leading-4.5 sm:text-sm'>{t('description')}</p>
					</div>
				</div>
				<div className={styles['value']}>
					<div className='text-center'>
						<p className='text-4xl leading-none font-semibold tabular-nums sm:text-5xl sm:leading-14.5'>
							{t('amount')}
						</p>
						<p className='text-xs leading-4'>{t('balance')}</p>
					</div>
					<p className='text-center text-xs leading-4'>{t('validity')}</p>
				</div>
			</div>
		</GiftCardMotion>
	);
}
