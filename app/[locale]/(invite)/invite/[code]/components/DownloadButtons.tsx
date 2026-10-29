'use client';

import React from 'react';
import { AcquisitionChoice } from '@/libs/components/AcquisitionChoice';
import { useTranslations } from '@/libs/i18n/client';
import type { DesktopDownloadKey, DesktopDownloads } from '../utils/desktop-downloads';
import { AppleIcon, WindowsIcon } from './DesignIcons';

const detectMacVariant = (): 'macArm64' | 'macX64' => {
	if (/arm|aarch/i.test(navigator.platform)) {
		return 'macArm64';
	}
	return /Intel/i.test(navigator.userAgent) ? 'macX64' : 'macArm64';
};

export function DownloadButtons({ downloads }: { downloads: DesktopDownloads }) {
	const t = useTranslations('pages.invite.download');
	const [macVariant, setMacVariant] = React.useState<DesktopDownloadKey>('macArm64');

	React.useEffect(() => {
		setMacVariant(detectMacVariant());
	}, []);

	const buttons = [
		{ label: t('mac'), href: downloads[macVariant], Icon: AppleIcon },
		{ label: t('windows'), href: downloads.windows, Icon: WindowsIcon },
	].filter((button): button is { label: string; href: string; Icon: typeof AppleIcon } => Boolean(button.href));

	if (!buttons.length) {
		return <p className='text-muted-foreground text-sm'>{t('unavailable')}</p>;
	}

	return (
		<div className='flex flex-wrap items-center justify-center gap-2.5'>
			<AcquisitionChoice />
			{buttons.map(({ label, href, Icon }) => (
				<a
					key={label}
					href={href}
					download
					className='bg-zinc-900 border-zinc-200 flex items-center gap-2.5 rounded-full border border-solid px-5.5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90'
				>
					<Icon className='h-4.5 w-auto shrink-0' />
					{label}
				</a>
			))}
		</div>
	);
}
