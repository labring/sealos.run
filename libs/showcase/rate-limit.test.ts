import assert from 'node:assert/strict';
import test from 'node:test';
import { createRateLimiter } from './rate-limit.ts';

test('allows `limit` requests per key per window, then resets', () => {
	let time = 0;
	const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
	assert.deepEqual([allow('a'), allow('a'), allow('a')], [true, true, false]);
	assert.equal(allow('b'), true);
	time = 999;
	assert.equal(allow('a'), false);
	time = 1000;
	assert.equal(allow('a'), true);
});
