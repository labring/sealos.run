/**
 * Fixed-window request limit kept in this process. With several replicas each
 * one counts separately, so the effective limit is `limit` × replicas.
 */
export function createRateLimiter({
	limit,
	windowMs,
	now = Date.now,
}: {
	limit: number;
	windowMs: number;
	now?: () => number;
}): (key: string) => boolean {
	const windows = new Map<string, { start: number; count: number }>();
	return (key) => {
		const time = now();
		if (windows.size > 10_000) {
			for (const [other, window] of windows) {
				if (time - window.start >= windowMs) windows.delete(other);
			}
		}
		const window = windows.get(key);
		if (!window || time - window.start >= windowMs) {
			windows.set(key, { start: time, count: 1 });
			return true;
		}
		window.count += 1;
		return window.count <= limit;
	};
}
