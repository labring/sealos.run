'use client';

import Image from 'next/image';
import React from 'react';
import { cn } from '@/libs/utils/styling';

export function ProjectGallery({ name, urls }: { name: string; urls: string[] }) {
	const [index, setIndex] = React.useState(0);
	const selected = urls[index];
	if (!selected) return null;
	return (
		<figure className='mt-10 min-w-0'>
			<div className='bg-muted relative aspect-3/2 overflow-hidden rounded-2xl border'>
				<Image
					src={selected}
					fill
					unoptimized
					priority
					alt={`${name} 界面预览，第 ${index + 1} 张`}
					sizes='(min-width: 1024px) 66vw, 100vw'
					className='object-contain'
				/>
			</div>
			{urls.length > 1 && (
				<fieldset className='mt-3 flex flex-wrap gap-2'>
					<legend className='sr-only'>选择作品图片</legend>
					{urls.map((url, i) => (
						<button
							key={url}
							type='button'
							aria-label={`查看第 ${i + 1} 张作品图`}
							aria-pressed={index === i}
							onClick={() => setIndex(i)}
							className={cn(
								'bg-muted focus-visible:outline-brand relative h-12 w-18 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
								index === i ? 'border-brand' : 'hover:border-foreground/40 border-transparent',
							)}
						>
							<Image
								src={url}
								fill
								unoptimized
								sizes='72px'
								alt=''
								className='object-cover'
							/>
						</button>
					))}
				</fieldset>
			)}
		</figure>
	);
}
