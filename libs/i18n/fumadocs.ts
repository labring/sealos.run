import { defineI18n } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import type { NotReadonly } from '../utils/types';
import { routing } from './routing';

export const i18n = defineI18n({
	languages: routing.locales as NotReadonly<typeof routing.locales>,
	defaultLanguage: routing.defaultLocale,
});

const languageDisplayNames = new Intl.DisplayNames(['zh'], {
	type: 'language',
});

const localeTranslations = Object.fromEntries(
	routing.locales.map((locale) => [
		locale,
		{
			displayName: languageDisplayNames.of(locale) ?? locale,
		},
	]),
);

export const { provider: i18nUIProvider } = defineI18nUI(i18n, {
	translations: localeTranslations,
});
