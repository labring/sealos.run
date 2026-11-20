export async function register() {
	if (
		process.env['NEXT_RUNTIME'] !== 'nodejs' ||
		process.env['NODE_ENV'] !== 'production' ||
		process.env['SHOWCASE_SYNC_ENABLED'] !== '1'
	)
		return;

	const { startShowcaseScheduler } = await import('./libs/showcase/scheduler.ts');
	startShowcaseScheduler();
}
