import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import type React from 'react';
import { AcquisitionObserver } from '@/libs/components/AcquisitionObserver';
import { BaiduAnalytics } from '@/libs/components/BaiduAnalytics';
import { RybbitAnalytics } from '@/libs/components/RybbitAnalytics';
import { i18nUIProvider } from '@/libs/i18n/fumadocs';
import { getPrimaryLocale } from '@/libs/i18n/routing';
import { cn } from '@/libs/utils/styling';

import './global.css';

// [TODO] Should add a chinese font.

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
	const { locale } = await params;
	const actualLocale = getPrimaryLocale(locale);

	return (
		<html
			lang={actualLocale}
			className={cn(inter.className, 'light')}
			style={{
				colorScheme: 'light',
			}}
			suppressHydrationWarning
		>
			<head>
				{/* Favicon and App Icons */}
				<link
					rel='icon'
					type='image/png'
					href='/favicon/favicon-96x96.png'
					sizes='96x96'
				/>
				<link
					rel='icon'
					type='image/svg+xml'
					href='/favicon/favicon.svg'
				/>
				<link
					rel='shortcut icon'
					href='/favicon/favicon.ico'
				/>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/apple-touch-icon.png'
				/>
				<link
					rel='manifest'
					href='/favicon/site.webmanifest'
				/>

				{/* Viewport and Mobile Optimization */}
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, shrink-to-fit=no'
				/>
				<meta
					name='mobile-web-app-capable'
					content='yes'
				/>
				<meta
					name='apple-mobile-web-app-capable'
					content='yes'
				/>
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='default'
				/>
				<meta
					name='apple-mobile-web-app-title'
					content='Sealos'
				/>
				<meta
					name='application-name'
					content='Sealos'
				/>
				<meta
					name='msapplication-TileColor'
					content='#ffffff'
				/>
				<meta
					name='theme-color'
					content='#ffffff'
				/>

				<meta
					name='referrer'
					content='strict-origin-when-cross-origin'
				/>

				{/* Performance and Resource Hints */}
				<link
					rel='dns-prefetch'
					href='https://www.googletagmanager.com'
				/>
				<link
					rel='dns-prefetch'
					href='https://www.google-analytics.com'
				/>
				<link
					rel='dns-prefetch'
					href='https://hm.baidu.com'
				/>
				<link
					rel='dns-prefetch'
					href='https://analytics.sealos.in'
				/>
				<link
					rel='dns-prefetch'
					href='https://engage.sealos.in'
				/>

				{/* Preconnect to critical third-party domains */}
				<link
					rel='preconnect'
					href='https://www.googletagmanager.com'
				/>
				<link
					rel='preconnect'
					href='https://fonts.googleapis.com'
				/>
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>

				{/* Language and Locale */}
				<meta
					httpEquiv='Content-Language'
					content={actualLocale}
				/>
			</head>
			<body className='bg-background flex min-h-screen flex-col overflow-x-hidden'>
				<NextIntlClientProvider>
					<AcquisitionObserver />
					<BaiduAnalytics />
					<RybbitAnalytics />
					<RootProvider
						i18n={i18nUIProvider(actualLocale)}
						theme={{
							forcedTheme: 'light',
							enableSystem: false,
						}}
					>
						{children}
					</RootProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
