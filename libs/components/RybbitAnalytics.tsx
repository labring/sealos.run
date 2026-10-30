'use client';

import Script from 'next/script';

const RYBBIT_HOST = process.env['NEXT_PUBLIC_RYBBIT_HOST'];
const RYBBIT_SITE_ID = process.env['NEXT_PUBLIC_RYBBIT_SITE_ID'];

export function RybbitAnalytics() {
	if (!RYBBIT_HOST || !RYBBIT_SITE_ID) {
		return null;
	}

	const host = RYBBIT_HOST.replace(/\/+$/, '');

	return (
		<Script
			id='rybbit-analytics'
			strategy='afterInteractive'
			src={`${host}/api/script.js`}
			data-site-id={RYBBIT_SITE_ID}
			onReady={() => {
				window.dispatchEvent(new Event('sealos:analytics-ready'));
			}}
		/>
	);
}
