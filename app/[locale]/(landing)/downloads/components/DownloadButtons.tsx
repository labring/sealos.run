'use client';

import { Tooltip } from 'radix-ui';
import React from 'react';
import { ChevronDownIcon } from '@/assets/icons';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/libs/components/ui/dropdown-menu';
import { Icon } from '@/libs/components/ui/icon';
import type { DesktopDownloads } from '@/libs/utils/desktop-downloads';
import styles from '../sections/DownloadContent.module.css';

function DownloadPlatformIcon({ platform }: { platform: 'Mac' | 'Windows' }) {
	return platform === 'Mac' ? (
		<svg
			aria-hidden='true'
			viewBox='0 0 18 20'
			width='18'
			height='20'
			fill='currentColor'
		>
			<path d='M13.2 3.2C14 2.3 14.3 1.2 14.2 0c-1.1.1-2.3.8-3 1.6-.7.8-1.2 1.9-1.1 3 1.2.1 2.3-.5 3.1-1.4ZM16.7 14.6c-.4 1-1 2-1.7 3-1 1.3-1.9 2.4-3.2 2.4-1.2 0-1.6-.8-3.1-.8s-2 .8-3.2.8C4.2 20 3.3 18.9 2.4 17.6.2 14.5-.7 8.8 1.6 6.3c1-1.1 2.3-1.7 3.7-1.7 1.2 0 2.3.8 3.1.8s2.2-1 3.7-.8c1.3 0 2.7.7 3.5 1.8-3.1 1.9-2.6 6.2 1.1 8.2Z' />
		</svg>
	) : (
		<svg
			aria-hidden='true'
			viewBox='0 0 18 18'
			width='18'
			height='18'
			fill='currentColor'
		>
			<path d='M0 2.5 7.5 1.4v7H0Zm8.5-1.2L18 0v8.4H8.5ZM0 9.5h7.5v7.1L0 15.5Zm8.5 0H18V18l-9.5-1.3Z' />
		</svg>
	);
}

export function DownloadButtons({ downloads, enabled }: { downloads: DesktopDownloads; enabled: boolean }) {
	const macUrl = downloads.macArm64 ?? downloads.macX64;
	const keyboardInteraction = React.useRef(false);
	const [macMenuOpen, setMacMenuOpen] = React.useState(false);
	const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const cancelClose = () => clearTimeout(closeTimer.current);
	const scheduleClose = (event: React.PointerEvent) => {
		if (event.pointerType !== 'mouse' || keyboardInteraction.current) return;
		cancelClose();
		closeTimer.current = setTimeout(() => setMacMenuOpen(false), 250);
	};
	React.useEffect(() => () => clearTimeout(closeTimer.current), []);
	if (!enabled) {
		return (
			<div className={styles['downloadControls']}>
				<Tooltip.Provider delayDuration={200}>
					<div className={styles['downloadButtons']}>
						{(['Mac', 'Windows'] as const).map((platform) => (
							<Tooltip.Root key={platform}>
								<Tooltip.Trigger asChild>
									<span className={styles['disabledDownload']}>
										<button
											type='button'
											aria-label={`${platform} 版下载，10 月 24 日开放下载`}
											disabled
										>
											<DownloadPlatformIcon platform={platform} />
											{platform} 版下载
										</button>
									</span>
								</Tooltip.Trigger>
								<Tooltip.Portal>
									<Tooltip.Content
										side='top'
										sideOffset={10}
										className={styles['downloadTooltip']}
									>
										10 月 24 日开放下载，敬请期待
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip.Root>
						))}
					</div>
				</Tooltip.Provider>
			</div>
		);
	}

	return (
		<div className={styles['downloadControls']}>
			<div className={styles['downloadButtons']}>
				{macUrl && (
					<DropdownMenu
						open={macMenuOpen}
						onOpenChange={setMacMenuOpen}
						modal={false}
					>
						<DropdownMenuTrigger asChild>
							<button
								type='button'
								aria-label='Mac 版下载，选择芯片'
								onPointerEnter={(event) => {
									if (event.pointerType !== 'mouse') return;
									cancelClose();
									keyboardInteraction.current = false;
									setMacMenuOpen(true);
								}}
								onPointerLeave={scheduleClose}
								onPointerDown={(event) => {
									keyboardInteraction.current = false;
									if (event.pointerType === 'mouse') {
										event.preventDefault();
										cancelClose();
										setMacMenuOpen(true);
									}
								}}
								onKeyDown={() => {
									cancelClose();
									keyboardInteraction.current = true;
								}}
							>
								<DownloadPlatformIcon platform='Mac' />
								Mac 版下载
								<Icon
									src={ChevronDownIcon}
									className='size-4'
								/>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='start'
							sideOffset={8}
							className={styles['macDownloadMenu']}
							onPointerEnter={cancelClose}
							onPointerMove={cancelClose}
							onPointerLeave={scheduleClose}
							onPointerDownCapture={() => {
								cancelClose();
								keyboardInteraction.current = false;
							}}
							onKeyDownCapture={() => {
								cancelClose();
								keyboardInteraction.current = true;
							}}
							onCloseAutoFocus={(event) => {
								// Restore trigger focus for keyboard users, without a pointer-click focus ring.
								if (!keyboardInteraction.current) event.preventDefault();
							}}
						>
							{[
								{ label: 'Apple 芯片', url: downloads.macArm64 },
								{ label: 'Intel 芯片', url: downloads.macX64 },
							].map(({ label, url }) => (
								<DropdownMenuItem
									key={label}
									asChild
									disabled={!url}
									className={styles['macDownloadItem']}
								>
									<a
										href={url}
										download
									>
										{label}
										{!url && <span>暂不可用</span>}
									</a>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
				{downloads.windows && (
					<a
						href={downloads.windows}
						download
						aria-label='Windows 版下载'
					>
						<DownloadPlatformIcon platform='Windows' />
						Windows 版下载
					</a>
				)}
			</div>
			{(!macUrl || !downloads.windows) && (
				<p className={styles['downloadUnavailable']}>
					{!macUrl && !downloads.windows
						? '下载地址暂时不可用，请稍后刷新重试。'
						: `${!macUrl ? 'Mac' : 'Windows'} 下载暂时不可用，请稍后刷新重试。`}
				</p>
			)}
		</div>
	);
}
