/** Runs inside the website's release image, using only Node's standard library. */
export async function runScheduledSync(
	address: string | undefined,
	secret: string | undefined,
): Promise<'ok' | 'busy'> {
	if (!address || !secret) throw new Error('需要配置 SHOWCASE_SYNC_URL 和 SHOWCASE_SYNC_SECRET');
	const url = new URL(address);
	if (
		!['http:', 'https:'].includes(url.protocol) ||
		url.pathname !== '/api/showcase/sync' ||
		url.search ||
		url.hash ||
		url.username ||
		url.password
	) {
		throw new Error('SHOWCASE_SYNC_URL 必须是官网服务的 /api/showcase/sync 地址');
	}
	const response = await fetch(url, {
		method: 'POST',
		headers: { authorization: `Bearer ${secret}` },
		redirect: 'error',
		signal: AbortSignal.timeout(240_000),
	});
	const body: unknown = await response.json().catch(() => null);
	if (!body || typeof body !== 'object' || !('status' in body))
		throw new Error(`同步接口返回无效响应（HTTP ${response.status}）`);
	if (response.status === 409 && body.status === 'busy') return 'busy';
	if (response.status !== 200 || body.status !== 'ok') {
		const reason = 'reason' in body && typeof body.reason === 'string' ? `，${body.reason}` : '';
		throw new Error(`同步未完成（HTTP ${response.status}，${String(body.status)}）${reason}`);
	}
	if ('alertFailed' in body && body.alertFailed === true) throw new Error('同步告警未送达');
	const counts = ['listed', 'hidden', 'deleted'] as const;
	if (
		!counts.every((key) => {
			const value: unknown = Reflect.get(body, key);
			return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
		}) ||
		!('problems' in body) ||
		!Array.isArray(body.problems)
	)
		throw new Error('同步结果缺少有效计数');
	if (body.problems.length) throw new Error(`有 ${body.problems.length} 行未能完成同步`);
	return 'ok';
}

if (import.meta.main) {
	try {
		const status = await runScheduledSync(process.env['SHOWCASE_SYNC_URL'], process.env['SHOWCASE_SYNC_SECRET']);
		console.info(status === 'ok' ? '[showcase] 同步完成' : '[showcase] 已有同步在执行，本轮跳过');
	} catch (error) {
		console.error('[showcase]', error instanceof Error ? error.message : '同步失败');
		process.exitCode = 1;
	}
}
