'use client';

import React from 'react';
import { Icon } from '@/libs/components/ui/icon';
import { demoIcons } from '../assets/demo';
import { teableApproval, teableIntroduction } from '../utils/demo-replay';
import styles from './DesktopDemo.module.css';

type CursorStop = { at: number; target: string; move: number; click: number; hide?: number };
const firstStop: CursorStop = { at: 0, target: 'local', move: 1100, click: 1500 };
const stops: CursorStop[] = [
	firstStop,
	{ at: teableIntroduction.open, target: 'folder', move: 600, click: 2600 },
	{ at: 2900, target: 'choose', move: 700, click: 3900 },
	{ at: teableIntroduction.selected, target: 'send', move: 1500, click: 6500, hide: teableIntroduction.end },
	...(teableApproval
		? [
				{
					at: teableIntroduction.end + teableApproval.start,
					target: 'approve',
					move: 1100,
					click: teableIntroduction.end + teableApproval.end - 220,
					hide: teableIntroduction.end + teableApproval.end,
				},
			]
		: []),
];

// Positions come from the rendered controls, so the same gestures work at every breakpoint.
export function DemoCursor({ elapsed, surface }: { elapsed: number; surface: React.RefObject<HTMLDivElement | null> }) {
	const stop = stops.findLast((item) => elapsed >= item.at) ?? firstStop;
	const visible = elapsed < (stop.hide ?? Infinity);
	const lastPosition = React.useRef({ x: 0, y: 0 });
	const [path, setPath] = React.useState<{
		at: number;
		from: { x: number; y: number };
		to: { x: number; y: number };
	} | null>(null);
	React.useEffect(() => {
		if (!visible) return;
		const root = surface.current;
		const target = root?.querySelector<HTMLElement>(`[data-demo-target="${stop.target}"]`);
		if (!root || !target) {
			setPath(null);
			return;
		}
		const previous = lastPosition.current;
		const update = () => {
			const bounds = target.getBoundingClientRect();
			const container = root.getBoundingClientRect();
			const to = {
				x: Math.max(8, Math.min(container.width - 28, bounds.left - container.left + bounds.width / 2)),
				y: Math.max(8, Math.min(container.height - 28, bounds.top - container.top + bounds.height / 2)),
			};
			const from =
				stop.at === 0 ? { x: Math.min(container.width - 28, to.x + 85), y: Math.max(8, to.y - 65) } : previous;
			setPath({ at: stop.at, from, to });
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(root);
		observer.observe(target);
		root.addEventListener('scroll', update, true);
		return () => {
			observer.disconnect();
			root.removeEventListener('scroll', update, true);
		};
	}, [stop, surface, visible]);
	const travel = Math.min(1, Math.max(0, (elapsed - stop.at) / stop.move));
	const eased = travel * travel * (3 - 2 * travel);
	const progress = path?.at === stop.at ? eased : 1;
	const dx = path ? path.to.x - path.from.x : 0;
	const dy = path ? path.to.y - path.from.y : 0;
	const distance = Math.hypot(dx, dy) || 1;
	const bend = Math.sin(progress * Math.PI) * Math.min(14, distance * 0.08);
	const x = path ? path.from.x + dx * progress - (dy / distance) * bend : 0;
	const y = path ? path.from.y + dy * progress + (dx / distance) * bend : 0;
	React.useLayoutEffect(() => {
		if (visible && path?.at === stop.at) lastPosition.current = { x, y };
	}, [path, stop.at, visible, x, y]);
	const click = (elapsed - stop.click) / 300;
	const clicking = click >= 0 && click < 1;
	const opacity = Math.min(1, Math.max(0, ((stop.hide ?? Infinity) - elapsed) / 250));
	if (!path || opacity === 0) return null;
	return (
		<div
			className={styles['playbackCursor']}
			aria-hidden='true'
			data-cursor-target={stop.target}
			style={{ transform: `translate3d(${x}px, ${y}px, 0)`, opacity }}
		>
			{clicking && (
				<span
					className={styles['clickRing']}
					style={{ transform: `translate(-50%, -50%) scale(${0.35 + click * 1.1})`, opacity: 1 - click }}
				/>
			)}
			<span
				className={styles['cursorShape']}
				style={{
					transform: `translate(-5px, -5px) scale(${clicking ? 1 - Math.sin(click * Math.PI) * 0.16 : 1})`,
				}}
			>
				<Icon
					src={demoIcons.pointer}
					alt=''
				/>
			</span>
		</div>
	);
}
