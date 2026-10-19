import Image from 'next/image';
import { puzzleLogoColor } from '../assets';
import styles from '../sections/DownloadContent.module.css';

// The same tab proportions as the Paper puzzle, rearranged into two columns.
const topCut = 'H108 C108 23 126 41 149 41 C172 41 190 23 190 0 H298';
const rightTab = 'V108 C321 108 339 126 339 149 C339 172 321 190 298 190 V298';
const bottomTab = 'H190 C190 321 172 339 149 339 C126 339 108 321 108 298 H0';
const leftCut = 'V190 C23 190 41 172 41 149 C41 126 23 108 0 108 V0';
const pieces = [
	{ x: 0, y: 0, d: `M20 0 H298 ${rightTab} ${bottomTab} V20 Q0 0 20 0 Z` },
	{ x: 298, y: 0, d: `M0 0 H278 Q298 0 298 20 V298 ${bottomTab} ${leftCut} Z` },
	{ x: 0, y: 298, d: `M0 0 ${topCut} ${rightTab} ${bottomTab} Z` },
	{ x: 298, y: 298, d: `M0 0 ${topCut} V298 ${bottomTab} ${leftCut} Z` },
	{ x: 0, y: 596, d: `M0 0 ${topCut} ${rightTab} H20 Q0 298 0 278 Z` },
	{ x: 298, y: 596, d: `M0 0 ${topCut} V278 Q298 298 278 298 H0 ${leftCut} Z` },
];

export function MobileScenarioPuzzle() {
	return (
		<>
			<svg
				className={styles['mobilePuzzleBase']}
				viewBox='0 0 596 894'
				preserveAspectRatio='none'
				aria-hidden='true'
			>
				{pieces.map(({ d, x, y }) => (
					<path
						key={d}
						d={d}
						transform={`translate(${x} ${y})`}
						fill='white'
						stroke='#e5e5e5'
						vectorEffect='non-scaling-stroke'
					/>
				))}
			</svg>
			{pieces.map(({ d, x, y }, index) => {
				const clipId = `download-mobile-puzzle-clip-${index}`;
				const gradientId = `download-mobile-puzzle-border-${index}`;
				return (
					<span
						key={d}
						className={styles['mobilePuzzleHighlight']}
						data-mobile-scenario={index + 1}
						aria-hidden='true'
					>
						<svg
							className={styles['mobilePuzzleShape']}
							viewBox='0 0 596 894'
							preserveAspectRatio='none'
							aria-hidden='true'
						>
							<defs>
								<linearGradient
									id={gradientId}
									x1='0'
									y1='0'
									x2='0.5'
									y2='1'
								>
									<stop stopColor='#e5e5e5' />
									<stop
										offset='1'
										stopColor='#005bff'
									/>
								</linearGradient>
								<clipPath
									id={clipId}
									clipPathUnits='objectBoundingBox'
								>
									<path
										d={d}
										transform={`matrix(${1 / 596} 0 0 ${1 / 894} ${x / 596} ${y / 894})`}
									/>
								</clipPath>
							</defs>
							<path
								d={d}
								transform={`translate(${x} ${y})`}
								fill='white'
								stroke={`url(#${gradientId})`}
								vectorEffect='non-scaling-stroke'
							/>
						</svg>
						<span
							className={styles['mobilePuzzleLogoClip']}
							style={{ clipPath: `url(#${clipId})` }}
						>
							<Image
								src={puzzleLogoColor}
								alt=''
								width={500}
								height={500}
								loading='eager'
								className={styles['puzzleLogo']}
							/>
						</span>
					</span>
				);
			})}
		</>
	);
}
