import type { Metadata } from 'next';
import { getTranslations } from '@/libs/i18n/server';
import { DownloadSection } from './sections/DownloadSection';
import { HeroSection } from './sections/HeroSection';
import { RulesSection } from './sections/RulesSection';
import { isPlausibleInviteCode } from './utils/invite.config';
import { getInvitePreview, type InvitePreview } from './utils/invite-preview';

type PageProps = {
	params: Promise<{ locale: string; code: string }>;
};

// Personalized referral URLs must not pile up in search indexes.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'pages.invite.meta' });

	return {
		title: t('title'),
		description: t('description'),
		robots: {
			index: false,
			follow: true,
		},
	};
}

export default async function InvitePage({ params }: PageProps) {
	const { code: rawCode } = await params;
	const code = rawCode.trim();

	// The cloud backend is the single source of truth for code validity; the
	// format check only avoids a pointless request for obviously foreign paths.
	const preview: InvitePreview = isPlausibleInviteCode(code)
		? await getInvitePreview(code)
		: { status: 'not_found', inviterNickname: null };

	return (
		<div className='flex w-full flex-col'>
			<HeroSection preview={preview} />
			<DownloadSection code={code} />
			<RulesSection />
		</div>
	);
}
