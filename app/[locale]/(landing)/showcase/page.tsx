import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseAuthConfig, readSession, SESSION_COOKIE } from '@/libs/showcase/auth';
import { buildBoardPage } from '@/libs/showcase/board';
import { loadProjects, loadVoting } from '@/libs/showcase/load';
import { parsePage } from '@/libs/showcase/pagination';
import { BountySection } from './sections/BountySection';
import { HeroSection } from './sections/HeroSection';
import { ShowcaseSection } from './sections/ShowcaseSection';

const title = 'Vibe Coding 作品馆 — 晒出你用 Sealos Desktop 上线的项目';
const description = '别让代码停在本地。用 Sealos Desktop 把项目上线，提交作品并邀请朋友投票，前三名在作品馆置顶展示。';

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: '/showcase' },
	openGraph: { title, description, url: 'https://sealos.run/showcase', locale: 'zh_CN', type: 'website' },
};

const PAGE_SIZE = 10;
type PageProps = { searchParams: Promise<{ page?: string | string[]; q?: string | string[] }> };

export default async function ShowcasePage({ searchParams }: PageProps) {
	const { page, q } = await searchParams;
	const query = typeof q === 'string' ? q.trim() : '';
	const cookieStore = await cookies();
	const auth = parseAuthConfig(process.env);
	const voterId = auth
		? readSession(cookieStore.get(SESSION_COOKIE)?.value, auth.secret, Math.floor(Date.now() / 1000))
		: null;
	const [projects, voting] = await Promise.all([loadProjects(), loadVoting(voterId, Boolean(auth))]);
	return (
		<>
			<HeroSection />
			{projects && projects.length > 0 && (
				<ShowcaseSection
					board={buildBoardPage(projects, voting?.counts ?? null, {
						page: parsePage(page),
						query,
						pageSize: PAGE_SIZE,
					})}
					voting={voting}
					query={query}
				/>
			)}
			<BountySection />
		</>
	);
}
