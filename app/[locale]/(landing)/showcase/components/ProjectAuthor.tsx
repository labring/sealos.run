import css from '../sections/ShowcaseSection.module.css';
import type { ShowcaseProject } from '../utils/showcase.config';

export function ProjectAuthor({ project }: { project: ShowcaseProject }) {
	return (
		<span className={css['author']}>
			<span
				className={css['avatar']}
				aria-hidden='true'
			>
				{project.avatar}
			</span>
			<span className={css['authorName']}>@{project.author}</span>
			<span className={css['authorRole']}>{project.role}</span>
		</span>
	);
}
