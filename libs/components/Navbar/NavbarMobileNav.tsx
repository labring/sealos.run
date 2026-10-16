'use client';

import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { SolutionsLeadDialog } from '@/app/[locale]/(landing)/solutions/components/SolutionsLeadDialog';
import {
	BoxIcon,
	ChevronUpIcon,
	ContactIcon,
	CubesIcon,
	DatabaseIcon,
	MenuIcon,
	ModelIcon,
	ObjectStorageIcon,
	RocketIcon,
	XIcon,
} from '@/assets/icons';
import { buttonVariants } from '@/libs/components/ui/button';
import { Icon } from '@/libs/components/ui/icon';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@/libs/components/ui/navigation-menu';
import { useTranslations } from '@/libs/i18n/client';
import { Link, usePathname } from '@/libs/i18n/navigation';
import { cn } from '@/libs/utils/styling';
import { NavbarMobileContext } from './NavbarContainer';

interface NavLink {
	textI18nKey: string;
	href: string;
	panel?: React.ReactNode;
}

interface NavbarMobileNavProps {
	links: NavLink[];
	contactLabel: string;
	contactFormConfig: {
		endpoint: string;
		version: string;
	};
	signinHref: string;
	signinLabel: string;
}

const productItems = [
	{
		id: 'launchpad',
		label: '应用管理',
		href: '/products/launchpad',
		icon: BoxIcon,
	},
	{
		id: 'database',
		label: '数据库',
		href: '/products/database',
		icon: DatabaseIcon,
	},
	{ id: 'oss', label: '存储', href: '/products/oss', icon: ObjectStorageIcon },
	{ id: 'devbox', label: '云开发', href: '/products/devbox', icon: RocketIcon },
	{
		id: 'aiproxy',
		label: 'AI 模型',
		href: '/products/aiproxy',
		icon: ModelIcon,
	},
	{ id: 'app', label: '应用', href: '/products/appstore', icon: CubesIcon },
] as const;

export function NavbarMobileNav({
	links,
	contactLabel,
	contactFormConfig,
	signinHref,
	signinLabel,
}: NavbarMobileNavProps) {
	const t = useTranslations();
	const pathname = usePathname();
	const { open, setOpen } = React.useContext(NavbarMobileContext);

	const [productsOpen, setProductsOpen] = React.useState(true);
	const [contactOpen, setContactOpen] = React.useState(false);
	const prevPathnameRef = React.useRef(pathname);

	React.useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open, setOpen]);

	React.useEffect(() => {
		if (prevPathnameRef.current === pathname) return;
		prevPathnameRef.current = pathname;
		// Close the panel after navigation.
		setOpen(false);
	}, [pathname, setOpen]);

	const menuLinks = links.filter((l) => !l.panel);
	const productsLink = links.find((l) => l.panel);

	return (
		<div className='relative'>
			<button
				type='button'
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onClick={() => setOpen(!open)}
				className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-10')}
			>
				<Icon
					src={open ? XIcon : MenuIcon}
					className='size-6'
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
						className='bg-background fixed inset-x-0 top-16 bottom-0 z-50 w-screen shadow-sm'
					>
						<motion.div
							initial={{ height: 0 }}
							animate={{ height: 'calc(100dvh - 4rem)' }}
							exit={{ height: 0 }}
							transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
							className='w-screen overflow-hidden'
						>
							<div className='bg-background h-full w-screen overflow-y-auto pt-1'>
								<div className='container flex w-full flex-col px-4'>
									{/* Products */}
									<div className='flex w-full flex-col'>
										<button
											type='button'
											onClick={() => setProductsOpen((v) => !v)}
											className='flex w-full items-center gap-2 rounded-md px-2 py-3 text-base'
										>
											<span className='text-foreground text-sm'>
												{productsLink ? t(productsLink.textI18nKey) : '产品'}
											</span>
											<Icon
												src={ChevronUpIcon}
												className={cn(
													'text-muted-foreground size-4 transition-transform',
													productsOpen ? '' : 'rotate-180',
												)}
											/>
										</button>

										{productsOpen && (
											<NavigationMenu
												viewport={false}
												className='w-full max-w-none flex-none justify-start pb-3 [&>div]:w-full'
											>
												<NavigationMenuList className='w-full flex-col items-stretch justify-start gap-2'>
													{productItems.map((item) => {
														const isActive =
															pathname === item.href ||
															(pathname?.startsWith(`${item.href}/`) ?? false);
														return (
															<NavigationMenuItem
																key={item.id}
																className='w-full'
															>
																<NavigationMenuLink
																	asChild
																	className={cn(
																		'flex h-9 w-full flex-row items-center gap-2 rounded-md px-2 py-2 text-sm',
																		isActive
																			? 'bg-accent text-foreground font-medium'
																			: 'text-muted-foreground hover:text-foreground',
																	)}
																>
																	<Link href={item.href}>
																		<Icon
																			src={item.icon}
																			className={cn(
																				'size-4',
																				isActive ? 'text-brand' : '',
																			)}
																		/>
																		{item.label}
																	</Link>
																</NavigationMenuLink>
															</NavigationMenuItem>
														);
													})}
												</NavigationMenuList>
											</NavigationMenu>
										)}
									</div>

									{/* Links */}
									<NavigationMenu
										viewport={false}
										className='w-full max-w-none flex-none justify-start [&>div]:w-full'
									>
										<NavigationMenuList className='w-full flex-col items-stretch justify-start gap-0'>
											{menuLinks.map((item) => {
												const isActive =
													pathname === item.href ||
													(pathname?.startsWith(`${item.href}/`) ?? false);
												return (
													<React.Fragment key={item.href}>
														<div className='border-border/60 my-0.5 h-px w-full border-b' />
														<NavigationMenuItem className='w-full'>
															<NavigationMenuLink
																asChild
																className={cn(
																	'flex w-full items-start rounded-md px-2 py-3 text-sm',
																	isActive
																		? 'text-foreground font-medium'
																		: 'text-foreground',
																)}
															>
																<Link
																	href={item.href}
																	onClick={() => setOpen(false)}
																>
																	{t(item.textI18nKey)}
																</Link>
															</NavigationMenuLink>
														</NavigationMenuItem>
													</React.Fragment>
												);
											})}
											<div className='border-border/60 my-0.5 h-px w-full border-b' />
										</NavigationMenuList>
									</NavigationMenu>

									{/* Actions */}
									<NavigationMenu
										viewport={false}
										className='w-full max-w-none flex-none justify-start pt-3 [&>div]:w-full'
									>
										<NavigationMenuList className='w-full flex-col items-stretch justify-start gap-3'>
											<NavigationMenuItem className='w-full'>
												<NavigationMenuLink
													asChild
													className={cn(
														buttonVariants({ variant: 'secondary' }),
														'bg-accent text-foreground hover:bg-accent/80 h-9 w-full flex-row justify-center',
													)}
												>
													<button
														type='button'
														onClick={() => {
															setOpen(false);
															setContactOpen(true);
														}}
													>
														<Icon
															src={ContactIcon}
															className='size-4'
														/>
														{contactLabel}
													</button>
												</NavigationMenuLink>
											</NavigationMenuItem>

											<NavigationMenuItem className='w-full'>
												<NavigationMenuLink
													asChild
													className={cn(
														buttonVariants({ variant: 'default' }),
														'bg-foreground text-background hover:bg-foreground/90 focus:text-background hover:text-background focus:bg-foreground/90 h-9 w-full justify-center rounded-full',
													)}
												>
													<a href={signinHref}>{signinLabel}</a>
												</NavigationMenuLink>
											</NavigationMenuItem>
										</NavigationMenuList>
									</NavigationMenu>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<SolutionsLeadDialog
				endpoint={contactFormConfig.endpoint}
				formVersion={contactFormConfig.version}
				open={contactOpen}
				onOpenChange={setContactOpen}
			/>
		</div>
	);
}
