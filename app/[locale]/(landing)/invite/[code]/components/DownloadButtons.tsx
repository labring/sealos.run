'use client';

import React from 'react';
import { CheckIcon } from '@/assets/icons';
import { Button } from '@/libs/components/ui/button';
import { Icon } from '@/libs/components/ui/icon';
import { useTranslations } from '@/libs/i18n/client';
import { cn } from '@/libs/utils/styling';
import type { DesktopDownloadKey, DesktopDownloads } from '../utils/desktop-downloads';

const BUTTON_ORDER: DesktopDownloadKey[] = ['macArm64', 'macX64', 'windows'];

const detectPlatform = (): DesktopDownloadKey | null => {
	const ua = navigator.userAgent;
	if (/Mac|iPhone|iPad/i.test(ua)) {
		return /arm|aarch/i.test(navigator.platform) || !/Intel/i.test(ua) ? 'macArm64' : 'macX64';
	}
	if (/Windows/i.test(ua)) {
		return 'windows';
	}
	return null;
};

export function DownloadButtons({ downloads }: { downloads: DesktopDownloads }) {
	const t = useTranslations('pages.invite.download');
	const [current, setCurrent] = React.useState<DesktopDownloadKey | null>(null);

	React.useEffect(() => {
		setCurrent(detectPlatform());
	}, []);

	const available = BUTTON_ORDER.filter((key) => downloads[key]);
	if (!available.length) {
		return <p className='text-muted-foreground text-sm'>{t('unavailable')}</p>;
	}

	return (
		<div className='flex flex-col items-center gap-3'>
			<div className='flex flex-col items-center gap-3 sm:flex-row'>
				{available.map((key) => {
					const isCurrent = current === key;
					return (
						<Button
							key={key}
							asChild
							variant={isCurrent ? 'default' : 'outline'}
							size='lg'
							className='h-12 px-8 text-base'
						>
							<a
								href={downloads[key]}
								className={cn(isCurrent && 'gap-2')}
								download
							>
								{isCurrent && (
									<Icon
										src={CheckIcon}
										className='size-4'
									/>
								)}
								{t(key)}
							</a>
						</Button>
					);
				})}
			</div>
			{current && available.includes(current) && (
				<p className='text-muted-foreground text-sm'>{t('currentPlatform')}</p>
			)}
		</div>
	);
}
