'use client';

import React from 'react';
import { Button } from '@/libs/components/ui/button';
import { useRouter } from '@/libs/i18n/navigation';
import { searchProjects } from '@/libs/showcase/filters';
import { paginate } from '@/libs/showcase/pagination';
import { PODIUM_SIZE, podiumGap, rankProjects, type VoteSnapshot, votesToPodium } from '@/libs/showcase/ranking';
import { Pagination } from '../components/Pagination';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectRow } from '../components/ProjectRow';
import { ShowcaseSearch } from '../components/ShowcaseSearch';
import { showcaseProjects } from '../utils/showcase.config';
import { useVotes } from '../utils/useVotes';
import css from './ShowcaseSection.module.css';

const PAGE_SIZE = 10;
type ShowcaseSectionProps = { initialSnapshot: VoteSnapshot | null; page: number; query: string };

export function ShowcaseSection({ initialSnapshot, page, query }: ShowcaseSectionProps) {
	const { snapshot, pendingId, failedId, vote } = useVotes(initialSnapshot);
	const router = useRouter();
	const listRef = React.useRef<HTMLElement>(null);
	const listKey = JSON.stringify([page, query]);
	const shownList = React.useRef(listKey);

	React.useEffect(() => {
		if (shownList.current === listKey) return;
		shownList.current = listKey;
		const list = listRef.current;
		if (!list) return;
		window.scrollTo({
			top: window.scrollY + list.getBoundingClientRect().top - 88,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
		});
	}, [listKey]);

	const ranked = rankProjects(showcaseProjects, snapshot?.counts ?? {});
	const topThree = snapshot ? ranked.slice(0, PODIUM_SIZE) : [];
	const rest = snapshot ? ranked.slice(PODIUM_SIZE) : ranked;
	const matches = searchProjects(rest, query);
	const featuredMatches = searchProjects(topThree, query).length;
	const rows = paginate(matches, page, PAGE_SIZE);
	const voteProps = (id: string) => ({
		votes: snapshot ? (snapshot.counts[id] ?? 0) : null,
		voted: snapshot?.voted.includes(id) ?? false,
		busy: pendingId !== null,
		failed: failedId === id,
		onVote: () => vote(id),
	});

	return (
		<section
			className={css['section']}
			id='showcase'
		>
			<div className={css['container']}>
				<div className={css['heading']}>
					<h2>造物主作品馆</h2>
					<p>
						{snapshot
							? '全部在线真实运行，点赞前三名置顶展示'
							: '全部在线真实运行。点赞暂时不可用，请稍后再来为喜欢的作品助力'}
					</p>
				</div>
				{topThree.length > 0 && (
					<ol
						className={css['podium']}
						aria-label='点赞前三名'
					>
						{topThree.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								rank={project.rank}
								gap={podiumGap(ranked, project.rank)}
								vote={voteProps(project.id)}
							/>
						))}
					</ol>
				)}
				<ShowcaseSearch
					query={query}
					votingOpen={snapshot !== null}
				/>
				<section
					ref={listRef}
					className={css['table']}
					aria-label='更多作品'
				>
					<output className='sr-only'>
						找到 {matches.length} 个其他作品，上方前三名中有 {featuredMatches} 个匹配作品。
					</output>
					{rows.items.length > 0 ? (
						<ol className={css['list']}>
							{rows.items.map((project) => (
								<ProjectRow
									key={project.id}
									project={project}
									position={snapshot ? project.rank : null}
									toPodium={snapshot ? votesToPodium(ranked, project.id) : null}
									thirdVotes={snapshot ? (ranked[PODIUM_SIZE - 1]?.votes ?? null) : null}
									vote={voteProps(project.id)}
								/>
							))}
						</ol>
					) : (
						<div className={css['empty']}>
							<strong>{featuredMatches ? '匹配作品已在前三名展示' : '暂无匹配作品'}</strong>
							<p>{featuredMatches ? '可在上方作品卡片中查看详情。' : '试试其他作品名或作者名。'}</p>
							{query && (
								<Button
									variant='outline'
									onClick={() => {
										router.push('/showcase', { scroll: false });
										document.getElementById('showcase-search')?.focus({ preventScroll: true });
									}}
								>
									清除搜索
								</Button>
							)}
						</div>
					)}
				</section>
				{rows.pageCount > 1 && (
					<Pagination
						page={rows.page}
						pageCount={rows.pageCount}
						query={query}
					/>
				)}
			</div>
		</section>
	);
}
