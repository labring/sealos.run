type SearchableProject = { name: string; author: string };

/** Preserve the work-name/author query when moving between list pages. */
export function buildShowcaseHref({ page, query }: { page: number; query: string }): string {
	const params = new URLSearchParams();
	if (query) params.set('q', query);
	if (page > 1) params.set('page', String(page));
	const search = params.toString();
	return search ? `/showcase?${search}` : '/showcase';
}

/** Search site works/authors without changing the supplied global ranking. */
export function searchProjects<T extends SearchableProject>(projects: readonly T[], query: string): T[] {
	const needle = query.trim().toLocaleLowerCase();
	return projects.filter(
		(project) =>
			!needle || [project.name, project.author].some((text) => text.toLocaleLowerCase().includes(needle)),
	);
}
