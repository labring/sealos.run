'use client';

import React from 'react';
import { paginate } from '@/libs/showcase/pagination';
import { PODIUM_SIZE, rankProjects, type VoteSnapshot, votesToPodium } from '@/libs/showcase/ranking';
import { Pagination } from '../components/Pagination';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectRow } from '../components/ProjectRow';
import { showcaseProjects } from '../utils/showcase.config';
import { useVotes } from '../utils/useVotes';

/** Projects listed per page below the top three. */
const PAGE_SIZE = 10;

type ShowcaseSectionProps = {
	/** Null when votes are unavailable: projects are listed without counts or a top three. */
	initialSnapshot: VoteSnapshot | null;
	/** Requested list page, from the URL. */
	page: number;
};

export function ShowcaseSection({ initialSnapshot, page }: ShowcaseSectionProps) {
	const { snapshot, pendingId, failedId, vote } = useVotes(initialSnapshot);
	const listRef = React.useRef<HTMLUListElement>(null);
	const shownPage = React.useRef(page);

	// Changing page keeps the scroll position, so bring the top of the new page into view.
	React.useEffect(() => {
		if (shownPage.current === page) return;
		shownPage.current = page;
		listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [page]);

	const ranked = snapshot ? rankProjects(showcaseProjects, snapshot.counts) : null;
	const topThree = ranked?.slice(0, PODIUM_SIZE) ?? [];
	const rest = ranked ? ranked.slice(PODIUM_SIZE) : showcaseProjects;
	const rows = paginate(rest, page, PAGE_SIZE);
	const firstPosition = (ranked ? PODIUM_SIZE : 0) + rows.offset + 1;

	const voteProps = (id: string) => ({
		votes: snapshot ? (snapshot.counts[id] ?? 0) : null,
		voted: snapshot?.voted.includes(id) ?? false,
		busy: pendingId !== null,
		failed: failedId === id,
		onVote: () => vote(id),
	});

	return (
		<section className='bg-white pt-16 pb-20 sm:pt-20 sm:pb-28'>
			<div className='container mx-auto px-6'>
				<div className='text-center'>
					<h2 className='text-3xl font-semibold sm:text-5xl'>造物主作品馆</h2>
					<p className='text-muted-foreground mt-6'>
						{snapshot
							? '全部在线真实运行，点赞前三名置顶展示'
							: '全部在线真实运行。点赞暂时不可用，请稍后再来为喜欢的作品助力'}
					</p>
				</div>

				{topThree.length > 0 && (
					<div className='mt-16 grid gap-5 lg:grid-cols-3'>
						{topThree.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								rank={project.rank}
								vote={voteProps(project.id)}
							/>
						))}
					</div>
				)}

				{rows.items.length > 0 && (
					<ul
						ref={listRef}
						className='bg-card mt-5 scroll-mt-24 divide-y overflow-hidden rounded-2xl border first:mt-16'
					>
						{rows.items.map((project, index) => (
							<ProjectRow
								key={project.id}
								project={project}
								position={firstPosition + index}
								toPodium={ranked ? votesToPodium(ranked, project.id) : null}
								vote={voteProps(project.id)}
							/>
						))}
					</ul>
				)}

				{rows.pageCount > 1 && (
					<Pagination
						page={rows.page}
						pageCount={rows.pageCount}
					/>
				)}
			</div>
		</section>
	);
}
