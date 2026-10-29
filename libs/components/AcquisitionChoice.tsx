'use client';
import React from 'react';
import {
	createBrowserAcquisitionRuntime,
	readAcquisitionConsent,
	setAcquisitionAnalyticsConsent,
} from '@/libs/utils/acquisition-handoff';

export function AcquisitionChoice() {
	const [allowed, setAllowed] = React.useState(false);
	React.useEffect(() => {
		const sync = () =>
			setAllowed(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage === 'granted');
		sync();
		window.addEventListener('sealos_consent_update', sync);
		return () => window.removeEventListener('sealos_consent_update', sync);
	}, []);
	return (
		<label className='block text-sm'>
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
	);
}
