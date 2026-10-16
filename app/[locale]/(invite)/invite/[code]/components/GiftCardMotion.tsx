'use client';

import { motion, useInView, useMotionTemplate, useSpring, useTransform } from 'motion/react';
import React from 'react';
import styles from './GiftCard.module.css';

const PAPER_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export function GiftCardMotion({ back, children }: { back: React.ReactNode; children: React.ReactNode }) {
	const scene = React.useRef<HTMLDivElement>(null);
	const entered = useInView(scene, { once: true, amount: 0.35 });
	const tiltX = useSpring(0, PAPER_SPRING);
	const tiltY = useSpring(0, PAPER_SPRING);
	const spread = useSpring(0, PAPER_SPRING);
	const lift = useTransform(spread, [0, 1], [0, -5]);
	const backLift = useTransform(spread, [0, 1], [0, 5]);
	const backAngle = useTransform(spread, [0, 1], [0, -3]);
	const transform = useMotionTemplate`perspective(1000px) translateY(${lift}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
	const backTransform = useMotionTemplate`translateY(${backLift}px) rotate(${backAngle}deg)`;

	function reset() {
		tiltX.set(0);
		tiltY.set(0);
		spread.set(0);
	}

	React.useEffect(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const stopMotion = () => {
			if (preference.matches) {
				tiltX.set(0);
				tiltY.set(0);
				spread.set(0);
			}
		};
		preference.addEventListener('change', stopMotion);
		return () => preference.removeEventListener('change', stopMotion);
	}, [tiltX, tiltY, spread]);

	function followPointer(event: React.PointerEvent<HTMLDivElement>) {
		if (
			window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
			event.pointerType !== 'mouse' ||
			!window.matchMedia('(hover: hover) and (pointer: fine)').matches
		) {
			return;
		}

		// Measure the stationary wrapper so the moving ticket cannot chase its own bounds.
		const bounds = event.currentTarget.getBoundingClientRect();
		const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
		const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
		tiltX.set(-y * 6);
		tiltY.set(x * 8);
		spread.set(1);
	}

	return (
		<div
			ref={scene}
			className={styles['scene']}
			data-entered={entered}
			onPointerEnter={followPointer}
			onPointerMove={followPointer}
			onPointerLeave={reset}
			onPointerCancel={reset}
		>
			<div className={styles['entrance']}>
				<motion.div
					className={styles['stack']}
					style={{ transform: transform }}
				>
					<motion.div
						className={styles['backInteraction']}
						aria-hidden='true'
						style={{ transform: backTransform }}
					>
						<div className={styles['back']}>{back}</div>
					</motion.div>
					{children}
				</motion.div>
			</div>
		</div>
	);
}
