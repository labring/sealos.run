'use client';

import React from 'react';
import {
	completeAcquisitionBridge,
	createBrowserAcquisitionRuntime,
	getAcquisitionBridgeTarget,
	readAcquisitionConsent,
	setAcquisitionAnalyticsConsent,
	subscribeAcquisitionConsent,
} from '@/libs/utils/acquisition-handoff';

export function AppAttribution() {
	const [href, setHref] = React.useState<string>();
	const [consent, setConsent] = React.useState<'granted' | 'denied' | 'unspecified'>('unspecified');
	const [message, setMessage] = React.useState('正在继续登录…');
	const pending = React.useRef<Promise<string> | undefined>(undefined);
	const originalHref = React.useRef<string | undefined>(undefined);
	React.useEffect(() => {
		originalHref.current ??= window.location.href;
		setHref(originalHref.current);
		setConsent(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage);
		// Remove the capability before any subsequent navigation can expose it in a referrer.
		window.history.replaceState(null, '', window.location.pathname);
		return subscribeAcquisitionConsent(() => {
			setConsent(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage);
		});
	}, []);
	const bridge = href ? getAcquisitionBridgeTarget(href) : undefined;
	React.useEffect(() => {
		if (!href || !getAcquisitionBridgeTarget(href) || consent === 'unspecified') return;
		let active = true;
		const runtime = createBrowserAcquisitionRuntime();
		runtime.href = href;
		pending.current ??= completeAcquisitionBridge(href, runtime);
		pending.current
			.then((url) => {
				if (active) window.location.replace(url);
			})
			.catch(() => {
				if (active) setMessage('链接无效或已过期，请从 App 重新发起登录。');
			});
		return () => {
			active = false;
		};
	}, [href, consent]);
	const choose = (allowed: boolean) => {
		const next = setAcquisitionAnalyticsConsent(createBrowserAcquisitionRuntime(), allowed);
		window.dispatchEvent(new Event('sealos_consent_update'));
		setConsent(next.analytics_storage);
	};
	return (
		<main className='mx-auto max-w-xl space-y-5 px-6 py-16'>
			<h1 className='text-2xl font-semibold'>在 Sealos 中继续</h1>
			<output aria-live='polite'>
				{href && !bridge ? '链接无效或已过期，请从 App 重新发起登录。' : message}
			</output>
			{bridge && consent === 'unspecified' && (
				<>
					<p>允许将本次官网访问与 App 登录、部署和付费关联，用于统计转化效果吗？这不会开启广告追踪。</p>
					<div className='flex flex-wrap gap-3'>
						<button
							type='button'
							onClick={() => choose(true)}
							className='rounded border px-4 py-2'
						>
							允许关联并继续
						</button>
						<button
							type='button'
							onClick={() => choose(false)}
							className='rounded border px-4 py-2'
						>
							不关联，直接继续
						</button>
					</div>
				</>
			)}
		</main>
	);
}
