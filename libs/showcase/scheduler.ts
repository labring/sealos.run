import 'server-only';
import { runSync } from './sync';

const INTERVAL_MS = 5 * 60 * 1000;

type SchedulerGlobal = typeof globalThis & { showcaseSyncSchedulerStarted?: boolean };

const globalForScheduler = globalThis as SchedulerGlobal;

function scheduleNext(): void {
	const timer = setTimeout(() => {
		void runScheduledSync();
	}, INTERVAL_MS);
	timer.unref();
}

async function runScheduledSync(): Promise<void> {
	try {
		const result = await runSync({ force: false });
		switch (result.status) {
			case 'ok':
				break;
			case 'busy':
				break;
			case 'blocked':
				console.warn(`[showcase] scheduled sync blocked: ${result.reason}`);
				break;
			case 'failed':
				console.error(`[showcase] scheduled sync failed: ${result.reason}`);
				break;
			case 'unconfigured':
				console.warn(`[showcase] scheduled sync is unconfigured; missing: ${result.missing.join(', ')}`);
				break;
		}
		if ('alertFailed' in result && result.alertFailed) {
			console.warn(`[showcase] scheduled sync alert delivery failed during ${result.status}`);
		}
	} catch (error) {
		console.error('[showcase] scheduled sync failed unexpectedly', error);
	} finally {
		scheduleNext();
	}
}

export function startShowcaseScheduler(): void {
	if (globalForScheduler.showcaseSyncSchedulerStarted) return;
	globalForScheduler.showcaseSyncSchedulerStarted = true;
	scheduleNext();
}
