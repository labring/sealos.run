import { avatarOf, type ShowcaseProject } from '@/libs/showcase/project';
import css from '../sections/ShowcaseSection.module.css';

export function ProjectAuthor({ project }: { project: ShowcaseProject }) {
	return (
		<span className={css['author']}>
			<span
				className={css['avatar']}
				aria-hidden='true'
			>
				{avatarOf(project.author)}
			</span>
			<span className={css['authorName']}>@{project.author}</span>
			<span className={css['authorRole']}>{project.role}</span>
		</span>
	);
}
