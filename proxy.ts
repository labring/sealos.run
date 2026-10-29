import createNextIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/libs/i18n/routing';

export default createNextIntlMiddleware(routing);

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|appstore/icons/|images/|icons/|favicon/|favicon.ico|logo.svg|robots.txt|sitemap.xml|llms.txt|rss.xml).*)',
	],
};
