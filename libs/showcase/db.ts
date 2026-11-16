import 'server-only';
import { Pool } from 'pg';

const globalForShowcase = globalThis as typeof globalThis & { showcasePool?: Pool };

/**
 * Connection pool for showcase votes, or null when SHOWCASE_DATABASE_URL is not
 * configured. Kept on globalThis so dev hot reloads reuse one pool.
 */
export function getShowcasePool(): Pool | null {
	const connectionString = process.env['SHOWCASE_DATABASE_URL'];
	if (!connectionString) {
		return null;
	}
	globalForShowcase.showcasePool ??= new Pool({
		connectionString,
		max: 5,
		connectionTimeoutMillis: 3000,
	});
	return globalForShowcase.showcasePool;
}
