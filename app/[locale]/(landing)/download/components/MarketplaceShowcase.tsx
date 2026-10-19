import Image from 'next/image';
import { cn } from '@/libs/utils/styling';
import { marketplaceApps } from '../assets';
import styles from './MarketplaceShowcase.module.css';

// Paper uses five rows of nine tiles, with each row offset to vary the pattern.
const iconRows = Array.from({ length: 5 }, (_, row) => ({
	id: `row-${row}`,
	apps: Array.from({ length: 9 }, (_, column) => marketplaceApps[(row * 3 + column) % marketplaceApps.length]),
}));

export function MarketplaceShowcase({ className }: { className?: string }) {
	return (
		<div
			className={cn(styles['showcase'], className)}
			role='img'
			aria-label={`Sealos 应用商店模板：${marketplaceApps.map((app) => app.name).join('、')}`}
		>
			<div
				className={styles['grid']}
				aria-hidden='true'
			>
				{iconRows.flatMap((row) =>
					row.apps.map(
						(app) =>
							app && (
								<div
									className={cn(styles['tile'], 'border-hairline')}
									key={`${row.id}-${app.name}`}
								>
									<Image
										src={app.image}
										alt=''
										sizes='24px'
									/>
								</div>
							),
					),
				)}
			</div>
		</div>
	);
}
