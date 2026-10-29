'use client';
import React from 'react';
import {
	createBrowserAcquisitionRuntime,
	readAcquisitionConsent,
	setAcquisitionAnalyticsConsent,
	subscribeAcquisitionConsent,
} from '@/libs/utils/acquisition-handoff';

export function AcquisitionChoice() {
	const [allowed, setAllowed] = React.useState(false);
	React.useEffect(() => {
		const sync = () =>
			setAllowed(readAcquisitionConsent(createBrowserAcquisitionRuntime()).analytics_storage === 'granted');
		sync();
		return subscribeAcquisitionConsent(sync);
	}, []);
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
		</div>
	);
}
