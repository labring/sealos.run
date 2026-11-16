import Image from 'next/image';
import { Link } from '@/libs/i18n/navigation';
import type { ShowcaseProject } from '../utils/showcase.config';
import { VoteButton, type VoteButtonProps } from './VoteButton';

/** Only projects within this many votes of the top three show how close they are. */
const CHASE_HINT_MAX = 12;

type ProjectRowProps = {
	project: ShowcaseProject;
	position: number;
	/** Votes still needed to reach the top three; null when unknown. */
	toPodium: number | null;
	vote: Omit<VoteButtonProps, 'name' | 'className'>;
};

export function ProjectRow({ project, position, toPodium, vote }: ProjectRowProps) {
	return (
		<li className='hover:bg-accent relative flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-5 transition-colors sm:flex-nowrap sm:gap-6 sm:px-6'>
			<span className='text-muted-foreground hidden w-5 shrink-0 text-sm tabular-nums sm:block'>
				{String(position).padStart(2, '0')}
			</span>
			{/* Decorative here: the project name next to it already labels the row. */}
			<Image
				src={project.cover}
				alt=''
				sizes='(min-width: 640px) 144px, 96px'
				className='aspect-3/2 w-24 shrink-0 rounded-lg border object-cover object-top sm:w-36'
			/>
			<div className='min-w-0 flex-1'>
				<p className='flex flex-wrap items-center gap-x-3 gap-y-1'>
					<Link
						href={`/showcase/${project.id}`}
						className='text-lg font-medium after:absolute after:inset-0'
					>
						{project.name}
					</Link>
					{toPodium !== null && toPodium <= CHASE_HINT_MAX && (
						<span className='text-brand text-sm'>差 {toPodium} 赞进前三</span>
					)}
				</p>
				<p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
					{project.summary} · @{project.author}
				</p>
			</div>
			<VoteButton
				{...vote}
				name={project.name}
				className='relative z-10 shrink-0 max-sm:basis-full'
			/>
		</li>
	);
}
