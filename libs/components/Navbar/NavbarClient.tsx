'use client';

import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from '@/libs/i18n/client';
import { Link, usePathname } from '@/libs/i18n/navigation';
import { cn } from '@/libs/utils/styling';

interface NavLink {
	textI18nKey: string;
	href: string;
	panel?: React.ReactNode;
}

interface NavbarClientProps {
	links: NavLink[];
	className?: string;
	headerHeight?: number;
	desktopBreakpoint?: 'lg' | 'xl';
}

export function NavbarClient({ links, className, headerHeight = 64, desktopBreakpoint = 'lg' }: NavbarClientProps) {
	const desktopVisibility = desktopBreakpoint === 'xl' ? 'xl:block' : 'lg:block';
	const t = useTranslations();
	const pathname = usePathname();
	const [openedPanel, setOpenedPanel] = React.useState('');
	const [mounted, setMounted] = React.useState(false);
	const prevPathnameRef = React.useRef(pathname);

	const openedItem = links.find((item) => item.href === openedPanel && item.panel);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	React.useEffect(() => {
		if (!openedPanel) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpenedPanel('');
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [openedPanel]);

	React.useEffect(() => {
		if (prevPathnameRef.current === pathname) return;
		prevPathnameRef.current = pathname;
		setOpenedPanel('');
	}, [pathname]);

	return (
		<>
			<nav className={cn('flex items-center', className)}>
				<ul className='flex items-center gap-0'>
					{links.map((item) => {
						if (item.panel) {
							const isOpen = openedPanel === item.href;
							return (
								<li
									key={item.href}
									className='relative'
								>
									<button
										type='button'
										aria-expanded={isOpen}
										onClick={() => setOpenedPanel(isOpen ? '' : item.href)}
										className={cn(
											'h-auto rounded-md bg-transparent px-5 py-2 text-sm font-normal transition-colors',
											isOpen
												? 'bg-accent/50 text-accent-foreground'
												: 'hover:bg-accent hover:text-accent-foreground',
										)}
									>
										{t(item.textI18nKey)}
									</button>
								</li>
							);
						}

						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className='hover:bg-accent hover:text-accent-foreground inline-flex h-auto rounded-md bg-transparent px-5 py-2 text-sm font-normal transition-colors'
								>
									{t(item.textI18nKey)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{mounted &&
				createPortal(
					<>
						<AnimatePresence>
							{openedPanel && (
								<motion.button
									type='button'
									aria-label='Close products panel overlay'
									onClick={() => setOpenedPanel('')}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
									style={{ top: headerHeight }}
									className={cn(
										'fixed inset-x-0 bottom-0 z-40 hidden bg-black/35',
										desktopVisibility,
									)}
								/>
							)}
						</AnimatePresence>

						<AnimatePresence>
							{openedItem?.panel && (
								<motion.div
									initial={{ height: 0 }}
									animate={{ height: 'auto' }}
									exit={{ height: 0 }}
									transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
									style={{ top: headerHeight }}
									className={cn(
										'bg-card fixed inset-x-0 z-50 hidden w-screen overflow-hidden border-t',
										desktopVisibility,
									)}
								>
									<div className='to-card h-90 bg-linear-to-r from-blue-100/30 from-50% to-50%'>
										{openedItem.panel}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</>,
					document.body,
				)}
		</>
	);
}
