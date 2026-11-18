import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FlatArrowLeftIcon } from '@/assets/icons';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { Icon } from '@/libs/components/ui/icon';
import { Link } from '@/libs/i18n/navigation';
import { standingOf } from '@/libs/showcase/board';
import { loadBoard, loadVoted } from '@/libs/showcase/load';
import { avatarOf } from '@/libs/showcase/project';
import { parseVoterId, VOTER_COOKIE } from '@/libs/showcase/vote-request';
import { showcaseLinks } from '../utils/showcase.config';
import { ProjectVotePanel } from './components/ProjectVotePanel';

type PageProps = {
	params: Promise<{ id: string }>;
};

const findProject = async (id: string) => {
	const board = await loadBoard();
	const project = board?.projects.find((item) => item.id === id);
	return board && project ? { project, standing: standingOf(board.projects, board.counts, id) } : null;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	const found = await findProject(id);
	if (!found) {
		return {};
	}
	const { project } = found;
	const title = `${project.name} — Vibe Coding 作品馆`;
	return {
		title,
		description: project.summary,
		alternates: { canonical: `/showcase/${project.id}` },
		openGraph: {
			title,
			description: project.summary,
			url: `https://sealos.run/showcase/${project.id}`,
			locale: 'zh_CN',
			type: 'website',
		},
	};
}

export default async function ShowcaseProjectPage({ params }: PageProps) {
	const { id } = await params;
	const found = await findProject(id);
	if (!found?.standing) {
		notFound();
	}
	const { project, standing } = found;

	const cookieStore = await cookies();
	const voted = await loadVoted(parseVoterId(cookieStore.get(VOTER_COOKIE)?.value));

	return (
		<div className='container mx-auto px-6 pt-12 sm:pt-16'>
			<Link
				href='/showcase'
				className='text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors'
			>
				<Icon
					src={FlatArrowLeftIcon}
					className='size-4'
				/>
				返回作品馆
			</Link>

			<div className='mt-10 grid gap-10 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					<p className='text-muted-foreground text-sm'>{new URL(project.url).host}</p>
					<h1 className='mt-4 text-4xl leading-tight font-semibold sm:text-5xl'>{project.name}</h1>
					<p className='text-muted-foreground mt-6 text-lg leading-relaxed'>{project.summary}</p>
					<div className='mt-8 flex flex-wrap gap-5'>
						<LandingOutlineButton
							href={project.url}
							target='_blank'
							rel='noreferrer'
						>
							打开线上产品
						</LandingOutlineButton>
					</div>

					<Image
						src={project.coverUrl}
						width={1200}
						height={800}
						unoptimized
						alt={`${project.name} 界面预览`}
						priority
						sizes='(min-width: 1024px) 66vw, 100vw'
						className='mt-10 w-full rounded-2xl border'
					/>

					<h2 className='mt-16 text-2xl font-semibold'>作品亮点</h2>
					<ul className='mt-6 grid gap-5 sm:grid-cols-3'>
						{project.highlights.map((highlight) => (
							<li
								key={highlight.title}
								className='rounded-2xl bg-linear-to-b from-zinc-100 to-zinc-50 p-6'
							>
								<p className='text-lg font-medium'>{highlight.title}</p>
								<p className='text-muted-foreground mt-2'>{highlight.detail}</p>
							</li>
						))}
					</ul>

					<h2 className='mt-16 text-2xl font-semibold'>一句话搭出同款</h2>
					<blockquote className='bg-card mt-6 rounded-2xl border p-6 text-lg leading-relaxed'>
						“{project.prompt}”
					</blockquote>
					<p className='text-muted-foreground mt-4 leading-relaxed'>
						在 Sealos Desktop 里说出这句话，数据库、存储和域名自动配齐，不用自己配服务器。
					</p>
					<LandingOutlineButton
						href={showcaseLinks.download}
						className='mt-6'
					>
						下载 Sealos Desktop
					</LandingOutlineButton>
				</div>

				<div className='flex flex-col gap-5 self-start lg:sticky lg:top-24'>
					<div className='bg-card flex items-center gap-4 rounded-2xl border p-6'>
						<span
							className='bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium'
							aria-hidden='true'
						>
							{avatarOf(project.author)}
						</span>
						<div className='min-w-0'>
							<p className='font-medium'>@{project.author}</p>
							<p className='text-muted-foreground mt-1 text-sm'>{project.role}</p>
						</div>
					</div>
					<ProjectVotePanel
						projectId={project.id}
						standing={standing}
						voted={voted.includes(project.id)}
					/>
				</div>
			</div>
		</div>
	);
}
