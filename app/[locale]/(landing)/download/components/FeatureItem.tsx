'use client';

import { useInView } from 'motion/react';
import React from 'react';
import styles from '../sections/DownloadContent.module.css';

export function FeatureItem({ children, id }: { children: React.ReactNode; id?: string }) {
	const ref = React.useRef<HTMLElement>(null);
	const isActive = useInView(ref, { margin: '0px 0px -60% 0px', amount: 'some' });

	return (
		<article
			ref={ref}
			id={id}
			className={styles['feature']}
			data-active={isActive}
		>
			{children}
		</article>
	);
}
