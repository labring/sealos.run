import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parsePage } from '@/libs/showcase/pagination';
import { loadVoteSnapshot } from '@/libs/showcase/snapshot';
import { parseVoterId, VOTER_COOKIE } from '@/libs/showcase/vote-request';
import { BountySection } from './sections/BountySection';
import { HeroSection } from './sections/HeroSection';
import { ShowcaseSection } from './sections/ShowcaseSection';

const title = 'Vibe Coding 作品馆 — 晒出你用 Sealos Desktop 上线的项目';
const description =
	'别让代码停在本地。用 Sealos Desktop 一句话把项目真正上线，晒出作品即领现金，点赞前三的作品在作品馆置顶展示。';

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: '/showcase' },
	openGraph: { title, description, url: 'https://sealos.run/showcase', locale: 'zh_CN', type: 'website' },
};

type PageProps = { searchParams: Promise<{ page?: string | string[]; q?: string | string[] }> };

export default async function ShowcasePage({ searchParams }: PageProps) {
	const { page, q } = await searchParams;
	const cookieStore = await cookies();
	const snapshot = await loadVoteSnapshot(parseVoterId(cookieStore.get(VOTER_COOKIE)?.value));
	return (
		<>
			<HeroSection />
			<ShowcaseSection
				initialSnapshot={snapshot}
				page={parsePage(page)}
				query={typeof q === 'string' ? q.trim() : ''}
			/>
			<BountySection />
		</>
	);
}
