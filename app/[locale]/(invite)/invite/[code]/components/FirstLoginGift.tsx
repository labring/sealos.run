'use client';

import Image from 'next/image';
import React from 'react';
import { useTranslations } from '@/libs/i18n/client';
import { firstLoginCoupon } from '../assets';
import { GiftBadgeIcon } from './DesignIcons';
import styles from './FirstLoginGift.module.css';

export function FirstLoginGift() {
	const t = useTranslations('pages.invite.firstLoginGift');
	const couponId = React.useId();
	const [hovered, setHovered] = React.useState(false);
	const [opened, setOpened] = React.useState(false);
	const expanded = hovered || opened;

	return (
		<aside
			className={styles['gift']}
			data-expanded={expanded}
			aria-label={t('title')}
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse') setHovered(true);
			}}
			onPointerLeave={() => setHovered(false)}
			onPointerCancel={() => setHovered(false)}
			onKeyDown={(event) => {
				if (event.key === 'Escape') {
					setOpened(false);
					setHovered(false);
				}
			}}
		>
			<div
				id={couponId}
				className={styles['coupon']}
				aria-hidden={!expanded}
			>
				<Image
					src={firstLoginCoupon}
					alt=''
					className='absolute inset-0 size-full'
				/>
				<div className={styles['couponContent']}>
					<p className='text-4xl leading-11 font-semibold tabular-nums'>¥10</p>
					<p className='text-[10px] leading-3'>{t('validity')}</p>
				</div>
			</div>
			<button
				type='button'
				className={styles['panel']}
				aria-expanded={expanded}
				aria-controls={couponId}
				onClick={() => setOpened(!expanded)}
				onBlur={() => setOpened(false)}
			>
				<span className='flex items-center justify-between gap-3 text-[10px] leading-3'>
					<GiftBadgeIcon
						aria-hidden
						className='size-3 shrink-0 text-blue-600'
					/>
					<span>{t('eyebrow')}</span>
				</span>
				<span className='text-base leading-5.5 font-medium'>{t('title')}</span>
				<span className='text-[10px] leading-3 text-neutral-500'>{t('description')}</span>
			</button>
		</aside>
	);
}
