'use client';
import React from 'react';
import {
	createBrowserAcquisitionRuntime,
	issueAcquisitionAppLink,
	readAcquisitionConsent,
	setAcquisitionAnalyticsConsent,
	subscribeAcquisitionConsent,
} from '@/libs/utils/acquisition-handoff';

export function AcquisitionChoice() {
	const [allowed, setAllowed] = React.useState(false);
	const [busy, setBusy] = React.useState(false);
	const [message, setMessage] = React.useState('');
	React.useEffect(() => {
		const sync = () =>
			setAllowed(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage === 'granted');
		sync();
		return subscribeAcquisitionConsent(sync);
	}, []);
	const open = async () => {
		if (busy) return;
		const runtime = createBrowserAcquisitionRuntime();
		let link = 'zcode://sealos/open';
		if (readAcquisitionConsent(runtime).analytics_storage === 'granted') {
			setBusy(true);
			try {
				const attributedLink = await issueAcquisitionAppLink(runtime);
				if (readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage === 'granted')
					link = attributedLink;
			} catch {
				setMessage('来源关联暂时不可用，正在打开 Sealos。');
			} finally {
				setBusy(false);
			}
		}
		window.location.assign(link);
	};
	return (
		<div className='space-y-2 text-sm'>
			<label className='block'>
				<input
					type='checkbox'
					checked={allowed}
					onChange={(event) => {
						setAcquisitionAnalyticsConsent(createBrowserAcquisitionRuntime(), event.currentTarget.checked);
						window.dispatchEvent(new Event('sealos_consent_update'));
					}}
				/>{' '}
				允许将本次访问与 App 登录、使用关联，不开启广告追踪。
			</label>
			<button
				type='button'
				onClick={open}
				aria-disabled={busy}
				className='underline'
			>
				{busy ? '正在打开 Sealos…' : '安装完成，打开 Sealos'}
			</button>
			{message && (
				<output
					aria-live='polite'
					className='block'
				>
					{message}
				</output>
			)}
		</div>
	);
}
