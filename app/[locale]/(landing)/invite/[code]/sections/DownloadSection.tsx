import Image from 'next/image';
import { getTranslations } from '@/libs/i18n/server';
import { appShotA, appShotB } from '../assets';
import { DownloadButtons } from '../components/DownloadButtons';
import type { DesktopDownloads } from '../utils/desktop-downloads';

// 5x3 screenshot wall from the design spec; the middle card of the second
// row uses the alternate shot. Ids are pre-computed so JSX keys stay stable.
const GRID_ROWS: Array<Array<'a' | 'b'>> = [
	['a', 'a', 'a', 'a', 'a'],
	['a', 'b', 'a', 'a', 'a'],
	['a', 'a', 'a', 'a', 'a'],
];

const SHOT_ROWS = GRID_ROWS.map((row, rowId) => ({
	id: `row-${rowId}`,
	items: row.map((shot, shotId) => ({ id: `${rowId}-${shotId}`, shot })),
}));

export async function DownloadSection({ downloads }: { downloads: DesktopDownloads }) {
	const t = await getTranslations('pages.invite.download');

	return (
		<section
			id='download'
			className='bg-zinc-100 relative overflow-clip'
		>
			<div
				aria-hidden
				className='absolute inset-0 flex flex-col justify-center gap-5'
			>
				{SHOT_ROWS.map((row) => (
					<div
						key={row.id}
						className='flex justify-center gap-5'
					>
						{row.items.map((item) => (
							<Image
								key={item.id}
								src={item.shot === 'b' ? appShotB : appShotA}
								alt=''
								className='h-42 w-79 shrink-0 object-cover'
							/>
						))}
					</div>
				))}
			</div>
			<div
				aria-hidden
				className='absolute inset-0 backdrop-blur-[5px]'
				style={{
					backgroundImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 0%, #f6f6f6 100%)',
				}}
			/>
			<div className='container relative mx-auto flex flex-col items-center gap-8 px-6 py-20 text-center sm:py-25'>
				<h2 className='text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl'>{t('title')}</h2>
				<p className='text-lg text-pretty'>{t('subtitle')}</p>
				<DownloadButtons downloads={downloads} />
			</div>
		</section>
	);
}
