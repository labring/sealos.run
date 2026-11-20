'use client';

import React from 'react';
import { Button } from '@/libs/components/ui/button';
import { useRouter } from '@/libs/i18n/navigation';
import type { BoardPage } from '@/libs/showcase/board';
import type { ShowcaseProject } from '@/libs/showcase/project';
import type { VoteSnapshot } from '@/libs/showcase/ranking';
import { Pagination } from '../components/Pagination';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectRow } from '../components/ProjectRow';
import { ShowcaseSearch } from '../components/ShowcaseSearch';
import { useVotes } from '../utils/useVotes';
import css from './ShowcaseSection.module.css';

type ShowcaseSectionProps = {
	/** Null when the published catalog is unavailable. */
	board: BoardPage<ShowcaseProject> | null;
	/** The account's voting allowance and live counts. */
	voting: VoteSnapshot | null;
	query: string;
};

export function ShowcaseSection({ board, voting, query }: ShowcaseSectionProps) {
	const shown = board ? [...board.podium, ...board.rows] : [];
	const { snapshot, pendingId, failures, vote } = useVotes(voting);
	const page = board?.page ?? 1;
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

	const topThree = board?.podium ?? [];
	const rows = board?.rows ?? [];
	const featuredMatches = board?.featuredMatches ?? 0;
	const isEmpty = shown.length === 0 && !query;
	const voteProps = (id: string) => ({
		votes: snapshot ? (snapshot.counts[id] ?? 0) : null,
		voted: snapshot?.account === 'spent' && snapshot.votedProjectId === id,
		spent: snapshot?.account === 'spent',
		authUnavailable: snapshot?.account === 'unavailable',
		busy: pendingId !== null,
		failure: failures[id],
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
						{!board
							? '作品馆暂时打不开，请稍后再来'
							: snapshot && snapshot.account !== 'unavailable'
								? '登录后每天可投一票，前三名置顶展示'
								: '投票功能暂未开放'}
					</p>
				</div>
				{topThree.length > 0 && (
					<ol
						className={css['podium']}
						aria-label='投票前三名'
					>
						{topThree.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								rank={project.rank}
								gap={project.gap}
								vote={voteProps(project.id)}
							/>
						))}
					</ol>
				)}
				{board && (
					<>
						<ShowcaseSearch
							query={query}
							votingOpen={snapshot !== null && snapshot.account !== 'unavailable'}
						/>
						<section
							hidden={!query && rows.length === 0 && topThree.length > 0}
							ref={listRef}
							className={css['table']}
							aria-label='更多作品'
						>
							<output className='sr-only'>
								找到 {board?.matchCount ?? 0} 个其他作品，上方前三名中有 {featuredMatches} 个匹配作品。
							</output>
							{rows.length > 0 ? (
								<ol className={css['list']}>
									{rows.map((project) => (
										<ProjectRow
											key={project.id}
											project={project}
											position={project.rank}
											toPodium={project.toPodium}
											thirdVotes={(board?.podiumThreshold ?? 1) - 1}
											vote={voteProps(project.id)}
										/>
									))}
								</ol>
							) : (
								<div className={css['empty']}>
									<strong>
										{isEmpty
											? '作品即将上架'
											: featuredMatches
												? '匹配作品已在前三名展示'
												: '暂无匹配作品'}
									</strong>
									<p>
										{isEmpty
											? '第一批作品正在审核，很快就能在这里看到。'
											: featuredMatches
												? '可在上方作品卡片中查看详情。'
												: '试试其他作品名或作者名。'}
									</p>
									{query && (
										<Button
											variant='outline'
											onClick={() => {
												router.push('/showcase', { scroll: false });
												document
													.getElementById('showcase-search')
													?.focus({ preventScroll: true });
											}}
										>
											清除搜索
										</Button>
									)}
								</div>
							)}
						</section>
					</>
				)}
				{board && board.pageCount > 1 && (
					<Pagination
						page={board.page}
						pageCount={board.pageCount}
						query={query}
					/>
				)}
			</div>
		</section>
	);
}
