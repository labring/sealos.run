import affineIcon from './affine.webp';
import capIcon from './cap.webp';
import difyIcon from './dify.webp';
import fastgptIcon from './fastgpt.webp';
import headscaleIcon from './headscale.webp';
import overleafIcon from './overleaf.webp';
import signozIcon from './signoz.webp';
import tianjiIcon from './tianji.webp';
import umamiIcon from './umami.webp';
import wordpressIcon from './wordpress.webp';

// Actual template thumbnails, preserved locally for the download-page illustration.
export const marketplaceApps = [
	{ name: 'AFFiNE', image: affineIcon },
	{ name: 'Umami', image: umamiIcon },
	{ name: 'Tianji', image: tianjiIcon },
	{ name: 'Overleaf', image: overleafIcon },
	{ name: 'Headscale', image: headscaleIcon },
	{ name: 'FastGPT', image: fastgptIcon },
	{ name: 'Dify', image: difyIcon },
	{ name: 'Cap', image: capIcon },
	{ name: 'WordPress', image: wordpressIcon },
	{ name: 'SigNoz', image: signozIcon },
] as const;
