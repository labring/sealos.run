import Image from 'next/image';
import { Link } from '@/libs/i18n/navigation';
import type { ShowcaseProject } from '@/libs/showcase/project';
import css from '../sections/ShowcaseSection.module.css';
import { ProjectAuthor } from './ProjectAuthor';
import { VoteButton, type VoteButtonProps } from './VoteButton';

const PLACES = ['人气冠军', '亚军', '季军'];
const RIVALS = ['亚军', '冠军', '亚军'];
const SPARKS = ['nw', 'ne', 'sw', 'se'];

type ProjectCardProps = {
	project: ShowcaseProject;
	rank: number;
	/** Lead over second place for the leader, otherwise distance to the rank above. */
	gap: number | null;
	vote: Omit<VoteButtonProps, 'name' | 'className'>;
};

function GapNote({ rank, gap }: { rank: number; gap: number }) {
	const rival = RIVALS[rank - 1];
	if (gap === 0) return <span>与{rival}同票</span>;
	return (
		<span>
			{rank === 1 ? '领先' : '距'}
			{rival} <em>{gap}</em> 票
		</span>
	);
}

export function ProjectCard({ project, rank, gap, vote }: ProjectCardProps) {
	return (
		<li
			className={css['slot']}
			data-rank={rank}
		>
			<article
				className={css['card']}
				data-rank={rank}
			>
				<span
					className={css['medal']}
					data-medal
					aria-hidden='true'
				>
					<span className={css['ribbon']} />
					<span className={css['disc']}>
						{rank}
						{rank === 1 &&
							SPARKS.map((id) => (
								<span
									key={id}
									className={css['spark']}
								/>
							))}
					</span>
				</span>
				<div className={css['cover']}>
					<Image
						src={project.coverUrl}
						width={1200}
						height={800}
						unoptimized
						alt={`${project.name} 界面预览`}
						sizes='(min-width: 1280px) 480px, (min-width: 901px) 36vw, (min-width: 641px) 50vw, 100vw'
					/>
				</div>
				<div className={css['cardBody']}>
					<span className={css['place']}>{PLACES[rank - 1]}</span>
					<h3 className={css['cardTitle']}>
						<Link
							href={`/showcase/${project.id}`}
							className={css['projectLink']}
						>
							{project.name}
						</Link>
					</h3>
					<p className={css['cardSummary']}>{project.summary}</p>
					<ProjectAuthor project={project} />
					<div className={css['score']}>
						{vote.votes !== null && (
							<p className={css['count']}>
								<b>
									{vote.votes}
									<small>票</small>
								</b>
								{gap !== null && (
									<GapNote
										rank={rank}
										gap={gap}
									/>
								)}
							</p>
						)}
						<VoteButton
							{...vote}
							name={project.name}
							className={css['cardVote']}
						/>
					</div>
				</div>
			</article>
			<div
				className={css['pedestal']}
				aria-hidden='true'
			>
				<strong>{rank}</strong>
				{PLACES[rank - 1]}
			</div>
		</li>
	);
}
