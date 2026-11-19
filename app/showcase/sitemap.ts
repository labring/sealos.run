import type { MetadataRoute } from 'next';
import { loadProjects } from '@/libs/showcase/load';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const projects = await loadProjects();
	if (!projects) throw new Error('作品目录暂时无法读取');
	const now = new Date();
	return projects.map(({ id }) => ({
		url: `https://sealos.run/showcase/${encodeURIComponent(id)}`,
		lastModified: now,
		changeFrequency: 'daily',
		priority: 0.6,
	}));
}
