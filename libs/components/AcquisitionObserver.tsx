'use client';

import React from 'react';
import {
	buildAcquisitionHandoffUrl,
	createBrowserAcquisitionRuntime,
	readAcquisitionContext,
	subscribeAcquisitionConsent,
} from '@/libs/utils/acquisition-handoff';

export function AcquisitionObserver() {
	const observations = React.useRef<{
		observedVisitor?: string;
		pending: Array<{ name: string; properties: Record<string, string> }>;
	}>({ pending: [] });
	React.useEffect(() => {
		const state = observations.current;
		const pending = state.pending;
		const runtimeWindow = window as Window & {
			dataLayer?: unknown[];
			rybbit?: {
				event?: (name: string, properties: Record<string, string>) => void;
			};
		};
		const flush = () => {
			if (readAcquisitionContext(createBrowserAcquisitionRuntime()).consent.analytics_storage !== 'granted') {
				pending.length = 0;
				return;
			}
			const context = readAcquisitionContext(createBrowserAcquisitionRuntime());
			// 访客 UUID 只作关联参数；提前 identify 会阻止首次账号识别回填匿名历史。
			if (!runtimeWindow.rybbit?.event) return;
			for (const item of pending.splice(0)) {
				if (item.properties['visitor_id'] === context.visitor_id)
					runtimeWindow.rybbit.event(item.name, item.properties);
			}
		};
		const emit = (name: string) => {
			const context = readAcquisitionContext(createBrowserAcquisitionRuntime());
			if (!context.visitor_id) return;
			const properties = {
				visitor_id: context.visitor_id,
				surface: 'website',
				source: context.source?.source || 'direct',
			};
			if (pending.length < 32) pending.push({ name, properties });
			flush();
		};
		const visit = () => {
			const context = readAcquisitionContext(createBrowserAcquisitionRuntime());
			if (!context.visitor_id) {
				state.observedVisitor = undefined;
				pending.length = 0;
				return;
			}
			if (state.observedVisitor !== context.visitor_id) {
				// Queued events from an older journey must not inherit the new visitor.
				pending.length = 0;
				state.observedVisitor = context.visitor_id;
				emit('acquisition_visit');
			}
			flush();
		};
		const click = (event: MouseEvent) => {
			const target =
				event.target instanceof Element ? event.target.closest('a[download], a[data-desktop-download]') : null;
			if (!target) return;
			emit('download_click');
			if (
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey ||
				event.defaultPrevented ||
				!(target instanceof HTMLAnchorElement)
			)
				return;
			let page: URL;
			try {
				page = new URL(window.location.href);
			} catch {
				return;
			}
			if (page.protocol !== 'https:' || !['sealos.cn', 'www.sealos.cn'].includes(page.hostname) || page.port)
				return;
			// sealos.cn 页面无法写入 Domain=sealos.run 的关联 Cookie，普通左键下载改经 sealos.run 中转以交接访客。
			const handoff = buildAcquisitionHandoffUrl(
				readAcquisitionContext(createBrowserAcquisitionRuntime()),
				target.href,
			);
			if (!handoff) return;
			event.preventDefault();
			window.location.assign(handoff);
		};
		visit();
		const unsubscribeConsent = subscribeAcquisitionConsent(visit);
		window.addEventListener('sealos:analytics-ready', visit);
		document.addEventListener('click', click, true);
		return () => {
			unsubscribeConsent();
			window.removeEventListener('sealos:analytics-ready', visit);
			document.removeEventListener('click', click, true);
		};
	}, []);
	return null;
}
