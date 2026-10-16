import styles from '../sections/DownloadContent.module.css';

export function DownloadButtons() {
	return (
		<div className={styles['downloadControls']}>
			<div className={styles['downloadButtons']}>
				<button
					type='button'
					disabled
					aria-label='Mac 版下载，即将推出'
				>
					<svg
						aria-hidden='true'
						viewBox='0 0 18 20'
						width='18'
						height='20'
						fill='currentColor'
					>
						<path d='M13.2 3.2C14 2.3 14.3 1.2 14.2 0c-1.1.1-2.3.8-3 1.6-.7.8-1.2 1.9-1.1 3 1.2.1 2.3-.5 3.1-1.4ZM16.7 14.6c-.4 1-1 2-1.7 3-1 1.3-1.9 2.4-3.2 2.4-1.2 0-1.6-.8-3.1-.8s-2 .8-3.2.8C4.2 20 3.3 18.9 2.4 17.6.2 14.5-.7 8.8 1.6 6.3c1-1.1 2.3-1.7 3.7-1.7 1.2 0 2.3.8 3.1.8s2.2-1 3.7-.8c1.3 0 2.7.7 3.5 1.8-3.1 1.9-2.6 6.2 1.1 8.2Z' />
					</svg>
					Mac 版下载
				</button>
				<button
					type='button'
					disabled
					aria-label='Windows 版下载，即将推出'
				>
					<svg
						aria-hidden='true'
						viewBox='0 0 18 18'
						width='18'
						height='18'
						fill='currentColor'
					>
						<path d='M0 2.5 7.5 1.4v7H0Zm8.5-1.2L18 0v8.4H8.5ZM0 9.5h7.5v7.1L0 15.5Zm8.5 0H18V18l-9.5-1.3Z' />
					</svg>
					Windows 版下载
				</button>
			</div>
			<span className={styles['comingSoon']}>即将推出</span>
		</div>
	);
}
