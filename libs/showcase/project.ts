export type ShowcaseHighlight = { title: string; detail: string };

/** A listed project as the site shows it. `id` is the Feishu record id. */
export type ShowcaseProject = {
	id: string;
	name: string;
	summary: string;
	/** Public address of the project running on Sealos. */
	url: string;
	/** Public posts supplied by the creator. Older catalogs may not include this field. */
	socialLinks?: string[];
	coverUrl: string;
	/** Additional screenshots in the editor's chosen order. */
	imageUrls: string[];
	author: string;
	role: string;
	prompt: string;
	highlights: readonly ShowcaseHighlight[];
};

/** The avatar is the first character of the author's display name. */
export function avatarOf(author: string): string {
	return Array.from(author.trim())[0]?.toUpperCase() ?? '';
}
