export const DESKTOP_DOWNLOAD_FEED_BASE_URL = 'https://sealox.oss-cn-hangzhou.aliyuncs.com/app/';

const INSTALLER_PATH_PATTERN = /\.(dmg|exe)$/i;

/**
 * Only https asset URLs published under the release feed's `releases/` prefix
 * count as installers; anything else must never receive an acquisition Cookie.
 */
export function isDesktopInstallerUrl(value: string): boolean {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}
	return (
		url.protocol === 'https:' &&
		!url.username &&
		!url.password &&
		!url.search &&
		!url.hash &&
		url.href.startsWith(`${DESKTOP_DOWNLOAD_FEED_BASE_URL}releases/`) &&
		INSTALLER_PATH_PATTERN.test(url.pathname)
	);
}
