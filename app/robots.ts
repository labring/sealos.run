import type { MetadataRoute } from 'next';

const SITE_URL = 'https://sealos.run';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/'],
		},
		sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/showcase/sitemap.xml`],
		host: SITE_URL,
	};
}
