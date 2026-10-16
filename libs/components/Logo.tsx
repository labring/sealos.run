import Image from 'next/image';
import type React from 'react';
import SealosLogoImage from '@/assets/sealos.svg';
import { getTranslations } from '@/libs/i18n/server';
import { cn } from '@/libs/utils/styling';

export async function Logo(
	props: Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'className'> & {
		withLogotype?: boolean;
		className?: {
			wrapper?: string;
			image?: string;
			text?: string;
		};
	},
) {
	const t = await getTranslations('components.logo');
	return (
		<div
			{...{ ...props, withLogotype: undefined }}
			className={cn('flex h-[1.5em] items-center', props.className?.wrapper)}
		>
			<Image
				src={SealosLogoImage}
				alt={t('alt')}
				className={cn('size-[1.5em]', props.className?.image)}
			/>
			{props.withLogotype && (
				<span className={cn('ml-2 text-lg font-semibold', props.className?.text)}>{t('title')}</span>
			)}
		</div>
	);
}
