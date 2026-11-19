'use client';

import { Link } from '@/libs/i18n/navigation';

export default function ShowcaseProjectError() {
	return (
		<div className='container mx-auto px-6 py-16'>
			<h1 className='text-3xl font-semibold'>作品馆暂时打不开</h1>
			<p className='text-muted-foreground mt-4'>请稍后再来查看这件作品。</p>
			<Link
				href='/showcase'
				className='mt-6 inline-block underline underline-offset-4'
			>
				返回作品馆
			</Link>
		</div>
	);
}
