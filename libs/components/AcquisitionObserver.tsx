'use client';

import React from 'react';
import {
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
			rybbit?: { event?: (name: string, properties: Record<string, string>) => void };
		};
		const flush = () => {
			if (readAcquisitionContext(createBrowserAcquisitionRuntime()).consent.analytics_storage !== 'granted') {
				pending.length = 0;
				return;
			}
			if (!runtimeWindow.rybbit?.event) return;
			for (const item of pending.splice(0)) runtimeWindow.rybbit.event(item.name, item.properties);
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
				state.observedVisitor = context.visitor_id;
				emit('acquisition_visit');
			}
			flush();
		};
		const click = (event: MouseEvent) => {
			const target =
				event.target instanceof Element ? event.target.closest('a[download], a[data-desktop-download]') : null;
			if (target) emit('download_click');
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
