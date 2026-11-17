import Image from 'next/image';
import { siBilibili, siTiktok, siX } from 'simple-icons';
import { SimpleIcon } from '@/libs/components/ui/simple-icon';
import { cn } from '@/libs/utils/styling';
import { wechatLogo, xiaohongshuLogo, zhihuLogo } from '../assets';
import css from './PlatformBadge.module.css';

const brands = {
	小红书: { image: xiaohongshuLogo },
	公众号: { image: wechatLogo },
	视频号: { image: wechatLogo },
	知乎: { image: zhihuLogo },
	B站: { icon: siBilibili.path, background: '#fb7299' },
	抖音: { icon: siTiktok.path, background: '#101010' },
	X: { icon: siX.path, background: '#101010' },
};

export function PlatformBadge({ platform, className }: { platform: keyof typeof brands; className?: string }) {
	const brand = brands[platform];
	return (
		<span className={cn(css['badge'], className)}>
			{'image' in brand ? (
				<Image
					src={brand.image}
					alt={platform}
					sizes='48px'
					className={css['image']}
				/>
			) : (
				<span
					className={css['vector']}
					style={{ background: brand.background }}
				>
					<SimpleIcon
						d={brand.icon}
						role='img'
						aria-label={platform}
					/>
				</span>
			)}
		</span>
	);
}
