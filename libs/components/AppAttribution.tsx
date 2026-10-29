'use client';

import React from 'react';
import {
	completeAcquisitionBridge,
	createBrowserAcquisitionRuntime,
	getAcquisitionBridgeTarget,
	issueAcquisitionAppLink,
	readAcquisitionConsent,
	setAcquisitionAnalyticsConsent,
	subscribeAcquisitionConsent,
} from '@/libs/utils/acquisition-handoff';

export function AppAttribution() {
	const [href, setHref] = React.useState<string>();
	const [consent, setConsent] = React.useState<'granted' | 'denied' | 'unspecified'>('unspecified');
	const [message, setMessage] = React.useState('在 Sealos 桌面端继续。');
	const [busy, setBusy] = React.useState(false);
	const pending = React.useRef<Promise<string> | undefined>(undefined);
	const originalHref = React.useRef<string | undefined>(undefined);
	React.useEffect(() => {
		originalHref.current ??= window.location.href;
		setHref(originalHref.current);
		setConsent(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage);
		// The page contains no trackers. Remove the short capability from the
		// address bar before any subsequent link can carry it as a referrer.
		window.history.replaceState(null, '', window.location.pathname);
		return subscribeAcquisitionConsent(() => {
			setConsent(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage);
		});
	}, []);
	const bridge = href ? getAcquisitionBridgeTarget(href) : undefined;
	const invalidBridge = href ? new URL(href).searchParams.has('handoff') && !bridge : false;
	React.useEffect(() => {
		if (!href || !getAcquisitionBridgeTarget(href) || consent === 'unspecified') return;
		let active = true;
		const runtime = createBrowserAcquisitionRuntime();
		runtime.href = href || runtime.href;
		pending.current ??= completeAcquisitionBridge(href || '', runtime);
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
		return next;
	};
	const open = async (allowed: boolean) => {
		choose(allowed);
		if (!allowed) {
			window.location.assign('zcode://sealos/open');
			return;
		}
		setBusy(true);
		setMessage('正在打开 Sealos…');
		try {
			const runtime = createBrowserAcquisitionRuntime();
			if (href) runtime.href = href;
			const link = await issueAcquisitionAppLink(runtime);
			window.location.assign(link);
			setMessage('如果未能打开，请确认已安装 Sealos，然后重试。');
		} catch {
			setMessage('来源交接暂时不可用，你仍可通过下方链接打开 Sealos。');
		} finally {
			setBusy(false);
		}
	};
	const act = (allowed: boolean) => {
		if (bridge) choose(allowed);
		else void open(allowed);
	};
	return (
		<main className='mx-auto max-w-xl space-y-5 px-6 py-16'>
			<h1 className='text-2xl font-semibold'>在 Sealos 中继续</h1>
			<output aria-live='polite'>{invalidBridge ? '链接无效或已过期，请从 App 重新发起登录。' : message}</output>
			{!invalidBridge && (!bridge || consent === 'unspecified') && (
				<>
					<p>允许将本次官网访问与 App 登录、部署和付费关联，用于统计转化效果吗？这不会开启广告追踪。</p>
					<div className='flex flex-wrap gap-3'>
						<button
							type='button'
							disabled={busy}
							onClick={() => act(true)}
							className='rounded border px-4 py-2'
						>
							允许关联并继续
						</button>
						<button
							type='button'
							disabled={busy}
							onClick={() => act(false)}
							className='rounded border px-4 py-2'
						>
							不关联，直接继续
						</button>
					</div>
				</>
			)}
			<p>
				<a
					href='zcode://sealos/open'
					className='underline'
				>
					直接打开 Sealos，不交接来源
				</a>
			</p>
			<p className='text-sm'>此网站使用国内账号服务。实际登录区域仍由你在 App 中的选择决定。</p>
		</main>
	);
}
