import { hasLocale } from 'next-intl';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
	locales: ['zh'],
	defaultLocale: 'zh',
	localePrefix: 'as-needed',
	localeDetection: false,
});

export function isRoutingLocale(locale: string | undefined | null): locale is (typeof routing.locales)[number] {
	return hasLocale(routing.locales, locale);
}

export function resolveLocale(locale: string | undefined | null): string {
	return isRoutingLocale(locale) ? locale : routing.defaultLocale;
}

export function getLocaleFallbackChain(locale: string): string[] {
	const normalizedLocale = resolveLocale(locale);
	const fallbackLocales = routing.locales.filter((candidate) => candidate !== normalizedLocale);

	return [normalizedLocale, ...fallbackLocales];
}

export function getPrimaryLocale(locale: string | undefined | null): string {
	const [primaryLocale] = getLocaleFallbackChain(resolveLocale(locale));
	return primaryLocale ?? routing.defaultLocale;
}
