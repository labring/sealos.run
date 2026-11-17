import Image from 'next/image';
import { ChevronUpIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { Link } from '@/libs/i18n/navigation';
import css from '../sections/ShowcaseSection.module.css';
import type { ShowcaseProject } from '../utils/showcase.config';
import { ProjectAuthor } from './ProjectAuthor';
import { VoteButton, type VoteButtonProps } from './VoteButton';

const CHASE_HINT_MAX = 12;
type ProjectRowProps = {
	project: ShowcaseProject;
	position: number | null;
	/** Votes still needed to pass third place; null when voting is unavailable. */
	toPodium: number | null;
	/** Third place's vote count, for the progress bar. */
	thirdVotes: number | null;
	vote: Omit<VoteButtonProps, 'name' | 'className'>;
};

export function ProjectRow({ project, position, toPodium, thirdVotes, vote }: ProjectRowProps) {
	const near = toPodium !== null && toPodium <= CHASE_HINT_MAX;
	const progress = near && thirdVotes !== null && vote.votes !== null ? (vote.votes / (thirdVotes + 1)) * 100 : 0;
	return (
		<li
			className={css['row']}
			data-near={near || undefined}
		>
			<span className={css['position']}>
				{position === null ? '—' : String(position).padStart(2, '0')}
				{position !== null && <span className='sr-only'>名</span>}
			</span>
			<div className={css['rowCover']}>
				<Image
					src={project.cover}
					alt=''
					sizes='(min-width: 1101px) 208px, (min-width: 641px) 160px, 112px'
					className={css['thumbnail']}
				/>
			</div>
			<div className={css['projectText']}>
				<h3 className={css['name']}>
					<Link
						href={`/showcase/${project.id}`}
						className={css['projectLink']}
					>
						{project.name}
					</Link>
				</h3>
				<p className={css['summary']}>{project.summary}</p>
				<ProjectAuthor project={project} />
			</div>
			<div className={css['rowAction']}>
				{near && (
					<p className={css['chase']}>
						<span>
							<Icon
								src={ChevronUpIcon}
								strokeWidth={2}
								aria-hidden='true'
							/>
							再得 <b>{toPodium}</b> 票进前三
						</span>
						<span
							className={css['chaseBar']}
							aria-hidden='true'
						>
							<i style={{ width: `${Math.min(100, Math.round(progress))}%` }} />
						</span>
					</p>
				)}
				{vote.votes !== null && (
					<p className={css['rowCount']}>
						<b>{vote.votes}</b>
						<small>票</small>
					</p>
				)}
				<VoteButton
					{...vote}
					name={project.name}
				/>
			</div>
		</li>
	);
}
