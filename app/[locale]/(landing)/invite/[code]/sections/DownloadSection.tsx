import { getTranslations } from '@/libs/i18n/server';
import { DownloadButtons } from '../components/DownloadButtons';
import type { DesktopDownloads } from '../utils/desktop-downloads';

export async function DownloadSection({ downloads }: { downloads: DesktopDownloads }) {
	const t = await getTranslations('pages.invite.download');

	return (
		<section
			id='download'
			className='flex w-full flex-col items-center bg-zinc-100 py-16'
		>
			<div className='container mx-auto flex flex-col items-center gap-6 px-6 text-center'>
				<h2 className='text-2xl font-semibold sm:text-3xl'>{t('title')}</h2>
				<p className='text-muted-foreground max-w-xl text-pretty'>{t('subtitle')}</p>
				<DownloadButtons downloads={downloads} />
			</div>
		</section>
	);
}
