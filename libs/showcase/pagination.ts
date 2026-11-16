export type Page<T> = { items: T[]; page: number; pageCount: number; offset: number };

/** Read a 1-based page number from a query value; anything that is not a positive whole number is page 1. */
export function parsePage(raw: unknown): number {
	if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
		return 1;
	}
	const page = Number(raw);
	return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/** One page of `items`. A page outside the valid range is clamped, so a stale link still shows results. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
	const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
	const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
	const offset = (current - 1) * pageSize;
	return { items: items.slice(offset, offset + pageSize), page: current, pageCount, offset };
}

/** Page numbers to offer: first, last and the neighbours of the current page, with gaps marked. */
export function getPageItems(currentPage: number, pageCount: number): Array<number | 'ellipsis'> {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}
	const items: Array<number | 'ellipsis'> = [1];
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(pageCount - 1, currentPage + 1);
	if (start > 2) {
		items.push('ellipsis');
	}
	for (let page = start; page <= end; page += 1) {
		items.push(page);
	}
	if (end < pageCount - 1) {
		items.push('ellipsis');
	}
	items.push(pageCount);
	return items;
}
