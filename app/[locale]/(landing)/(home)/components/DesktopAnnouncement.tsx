'use client';

import Image from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import React from 'react';
import { XIcon } from '@/assets/icons';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from '@/libs/components/ui/dialog';
import { Icon } from '@/libs/components/ui/icon';
import { DesktopHomeImage } from '../assets';
import styles from './DesktopAnnouncement.module.css';

const SEEN_KEY = 'sealos-desktop-launch-announcement-v1';

export function DesktopAnnouncement() {
	const [open, setOpen] = React.useState(false);
	const contentRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		try {
			if (localStorage.getItem(SEEN_KEY)) return;
			localStorage.setItem(SEEN_KEY, 'seen');
		} catch {
			// Storage may be unavailable; the announcement can still be dismissed.
		}
		setOpen(true);
	}, []);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogPortal>
				<DialogOverlay className={styles['overlay']} />
				<DialogPrimitive.Content
					ref={contentRef}
					className={styles['content']}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						contentRef.current?.focus();
					}}
				>
					<div className={styles['visual']}>
						<Image
							src={DesktopHomeImage}
							alt='Sealos Desktop 新建任务首页，可从本地代码、代码仓库或模板部署应用'
							sizes='(max-width: 624px) 82vw, 488px'
							className={styles['preview']}
						/>
						<span
							className={styles['badge']}
							aria-hidden='true'
						>
							NEW!
						</span>
						<DialogClose
							className={styles['close']}
							aria-label='关闭公告'
						>
							<Icon
								src={XIcon}
								className='size-4'
								strokeWidth={1.33}
								aria-hidden='true'
							/>
						</DialogClose>
					</div>
					<div className={styles['copy']}>
						<DialogTitle className={styles['title']}>
							Sealos 桌面 Agent 正式上线！
							<br />
							一句话上线任意代码到 Sealos 云上。
						</DialogTitle>
						<DialogDescription className={styles['reward']}>
							现在下载立即获得 <strong>¥10</strong> Sealos 额度。
						</DialogDescription>
						<LandingOutlineButton
							href='/downloads'
							size='lg'
							className={styles['download']}
						>
							立即下载
						</LandingOutlineButton>
					</div>
				</DialogPrimitive.Content>
			</DialogPortal>
		</Dialog>
	);
}
