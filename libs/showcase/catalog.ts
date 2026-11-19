import { z } from 'zod';
import type { ShowcaseProject } from './project.ts';

export const CATALOG_KEY = 'showcase/catalog.json';
const webUrl = z.url({ protocol: /^https?$/ });
const project = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	summary: z.string(),
	url: webUrl,
	socialLinks: z.array(webUrl).optional(),
	coverUrl: webUrl,
	imageUrls: z.array(webUrl),
	author: z.string(),
	role: z.string(),
	prompt: z.string(),
	highlights: z.array(z.object({ title: z.string(), detail: z.string() })),
});
const catalog = z.object({ version: z.literal(1), projects: z.array(project) });

export function publicBucketUrl(): string | null {
	const base = process.env['SHOWCASE_S3_PUBLIC_BASE_URL'];
	return base ? base.replace(/\/+$/, '') : null;
}

export function encodeCatalog(projects: readonly ShowcaseProject[]): Uint8Array<ArrayBuffer> {
	return new TextEncoder().encode(JSON.stringify(catalog.parse({ version: 1, projects })));
}

export async function readCatalog(base: string): Promise<ShowcaseProject[]> {
	const response = await fetch(`${base}/${CATALOG_KEY}`, {
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(5000),
	});
	if (!response.ok) throw new Error(`作品目录读取失败（HTTP ${response.status}）`);
	return catalog.parse(await response.json()).projects;
}
