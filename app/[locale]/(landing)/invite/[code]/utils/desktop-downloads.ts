import { desktopDownloadAssetUrl, desktopDownloadManifestUrl } from './invite.config';

export type DesktopDownloadKey = 'macArm64' | 'macX64' | 'windows';

export type DesktopDownloads = Partial<Record<DesktopDownloadKey, string>>;

const MANIFEST_REVALIDATE_SECONDS = 3600;

// Manifest file entries live on their own line, e.g.
// `  - url: releases/0.9.13/Sealos-Desktop-Preview-0.9.13-mac-arm64.dmg`.
// Line-scoped matching keeps values with spaces (e.g. `Sealos Setup 1.2.3.exe`)
// intact while releaseNotes blocks containing "- url:" prose are ignored
// because their indented continuation lines never match.
const FILE_URL_LINE_PATTERN = /^\s*-\s*url:\s*(.+?)\s*$/;

const classifyInstaller = (fileName: string): DesktopDownloadKey | null => {
	const lower = fileName.toLowerCase();
	if (lower.endsWith('.dmg')) {
		return lower.includes('arm64') || lower.includes('aarch64') ? 'macArm64' : 'macX64';
	}
	if (lower.endsWith('.exe')) {
		return 'windows';
	}
	return null;
};

const parseManifestInstallers = (manifest: string): DesktopDownloads => {
	const downloads: DesktopDownloads = {};
	for (const line of manifest.split('\n')) {
		const relativeUrl = line.match(FILE_URL_LINE_PATTERN)?.[1];
		if (!relativeUrl) {
			continue;
		}
		// Only asset paths published by the release pipeline are accepted.
		if (!relativeUrl.startsWith('releases/')) {
			continue;
		}
		const key = classifyInstaller(relativeUrl.split('/').pop() ?? '');
		if (key && !downloads[key]) {
			downloads[key] = desktopDownloadAssetUrl(relativeUrl);
		}
	}
	return downloads;
};

const fetchManifest = async (manifest: 'latest-mac.yml' | 'latest.yml') => {
	const response = await fetch(desktopDownloadManifestUrl(manifest), {
		next: { revalidate: MANIFEST_REVALIDATE_SECONDS },
		signal: AbortSignal.timeout(5000),
	});
	if (!response.ok) {
		return '';
	}
	return response.text();
};

/**
 * Resolve direct installer links from the desktop release feed manifests.
 * Returns an empty object when the feed is unreachable so the page can show a
 * retry hint instead of broken download buttons.
 */
export async function getDesktopDownloads(): Promise<DesktopDownloads> {
	// One unreachable feed must not fail the whole invite page SSR: fetch rejections
	// (timeout, DNS) degrade that source to an empty manifest so only its own
	// download buttons show the retry hint. Non-2xx already degrades in fetchManifest.
	const manifests = await Promise.allSettled([fetchManifest('latest-mac.yml'), fetchManifest('latest.yml')]).then(
		(results) => results.map((result) => (result.status === 'fulfilled' ? result.value : '')),
	);
	const downloads: DesktopDownloads = {};
	for (const manifest of manifests) {
		for (const [key, url] of Object.entries(parseManifestInstallers(manifest))) {
			downloads[key as DesktopDownloadKey] ??= url;
		}
	}
	return downloads;
}
