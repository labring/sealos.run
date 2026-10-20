import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/libs/blog/utils';

const SITE_URL = 'https://sealos.run';

const staticRoutes: Array<{
	path: string;
	changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
	priority: number;
}> = [
	{ path: '/', changeFrequency: 'weekly', priority: 1 },
	{ path: '/downloads', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/about-us', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/pricing/payg', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/private-cloud', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/solutions', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/docs', changeFrequency: 'weekly', priority: 0.8 },
	{ path: '/products/devbox', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/products/database', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/products/appstore', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/products/aiproxy', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/products/oss', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/products/launchpad', changeFrequency: 'monthly', priority: 0.8 },
	{ path: '/blog', changeFrequency: 'daily', priority: 0.7 },
];

const docsRoutes: Array<{
	path: string;
	changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
	priority: number;
}> = [
	{
		path: '/docs/getting-started/deploy-docker-image',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/getting-started/deploy-github-repo',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/getting-started/create-database',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/getting-started/create-object-storage',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/guides/feature-list',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/guides/account-workspace',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/guides/app-management',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{ path: '/docs/guides/devbox', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/docs/guides/ai-proxy', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/docs/guides/appstore', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/docs/guides/databases', changeFrequency: 'monthly', priority: 0.7 },
	{
		path: '/docs/guides/object-storage',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{ path: '/docs/guides/cron-jobs', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/docs/guides/terminal', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/docs/private-cloud', changeFrequency: 'monthly', priority: 0.7 },
	{
		path: '/docs/private-cloud/deployment',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
	{
		path: '/docs/private-cloud/operations',
		changeFrequency: 'monthly',
		priority: 0.7,
	},
];

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
		url: `${SITE_URL}${route.path}`,
		lastModified: now,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));

	const docsEntries: MetadataRoute.Sitemap = docsRoutes.map((route) => ({
		url: `${SITE_URL}${route.path}`,
		lastModified: now,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));

	const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
		url: `${SITE_URL}${post.url}`,
		lastModified: post.date ? new Date(post.date) : now,
		changeFrequency: 'monthly',
		priority: 0.6,
	}));

	return [...staticEntries, ...docsEntries, ...blogEntries];
}
