import Image from 'next/image';
import { Link } from '@/libs/i18n/navigation';
import { getTranslations } from '@/libs/i18n/server';
import { appShotA, appShotB, desktopPreview } from '../assets';
import { consoleInviteUrl } from '../utils/invite.config';
import styles from './DownloadSection.module.css';

// Seven rows of the original Paper assets fill the blurred backdrop.
const SHOT_ROWS = Array.from({ length: 7 }, (_, row) => ({
	id: `row-${row}`,
	items: Array.from({ length: 5 }, (_, column) => ({
		id: `${row}-${column}`,
		shot: row === 1 && column === 1 ? appShotB : appShotA,
	})),
}));

export async function DownloadSection({ code }: { code: string }) {
	const t = await getTranslations('pages.invite.download');

	return (
		<section
			id='download'
			className={styles['section']}
		>
			<div
				aria-hidden
				className={styles['wall']}
			>
				{SHOT_ROWS.map((row) => (
					<div
						key={row.id}
						className='flex gap-5.25'
					>
						{row.items.map(({ id, shot }) => (
							<Image
								key={id}
								src={shot}
								alt=''
								sizes='317px'
								className='h-42.5 w-79.25 shrink-0 object-cover'
							/>
						))}
					</div>
				))}
			</div>
			<div
				aria-hidden
				className={styles['veil']}
			/>
			<div className={styles['content']}>
				<div className={styles['intro']}>
					<h2 className='text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl lg:leading-none'>
						{t('title')}
					</h2>
					<p className='text-lg leading-7 text-pretty lg:leading-4.5'>{t('subtitle')}</p>
					<Link
						href={consoleInviteUrl(code)}
						className='mx-auto underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4'
					>
						{t('register')}
					</Link>
				</div>
				<Image
					src={desktopPreview}
					alt={t('previewAlt')}
					sizes='(max-width: 1148px) calc(100vw - 48px), 1100px'
					className={styles['preview']}
				/>
			</div>
		</section>
	);
}
