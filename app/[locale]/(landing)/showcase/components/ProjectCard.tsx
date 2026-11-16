import Image from 'next/image';
import { Link } from '@/libs/i18n/navigation';
import { cn } from '@/libs/utils/styling';
import type { ShowcaseProject } from '../utils/showcase.config';
import { VoteButton, type VoteButtonProps } from './VoteButton';

type ProjectCardProps = {
	project: ShowcaseProject;
	rank: number;
	vote: Omit<VoteButtonProps, 'name' | 'className'>;
};

/** A top-three project. The whole card links to the project page; the vote button sits above the link. */
export function ProjectCard({ project, rank, vote }: ProjectCardProps) {
	return (
		<article className='bg-card hover:border-brand relative flex flex-col overflow-hidden rounded-2xl border transition-colors'>
			<Image
				src={project.cover}
				alt={`${project.name} 界面预览`}
				sizes='(min-width: 1024px) 33vw, 100vw'
				className='aspect-3/2 w-full border-b object-cover object-top'
			/>

			<div className='flex flex-1 flex-col gap-6 p-6'>
				<div className='flex items-center justify-between gap-4 text-sm'>
					<span
						className={cn(
							'rounded-full border px-3 py-1',
							rank === 1 && 'bg-primary text-primary-foreground border-primary',
						)}
					>
						NO.{rank}
					</span>
					<span className='text-muted-foreground truncate'>{new URL(project.url).host}</span>
				</div>

				<div>
					<h3 className='text-xl font-medium'>
						<Link
							href={`/showcase/${project.id}`}
							className='after:absolute after:inset-0'
						>
							{project.name}
						</Link>
					</h3>
					<p className='text-muted-foreground mt-3 leading-relaxed'>{project.summary}</p>
				</div>

				<div className='mt-auto flex items-center justify-between gap-4'>
					<p className='text-muted-foreground text-sm'>
						@{project.author} · {project.platform} {project.reach}
					</p>
					<VoteButton
						{...vote}
						name={project.name}
						className='relative z-10 shrink-0'
					/>
				</div>
			</div>
		</article>
	);
}
