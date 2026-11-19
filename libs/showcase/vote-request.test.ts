import assert from 'node:assert/strict';
import test from 'node:test';
import { clientIp, parseVoteRequest } from './vote-request.ts';

test('parseVoteRequest accepts only a well-formed project id', () => {
	assert.deepEqual(parseVoteRequest({ projectId: 'recuAbC123' }), { projectId: 'recuAbC123' });
	for (const bad of [null, undefined, 'a', {}, { projectId: 1 }, { projectId: '' }, { projectId: "a'; --" }, ['a']]) {
		assert.equal(parseVoteRequest(bad), null);
	}
	assert.equal(parseVoteRequest({ projectId: 'a'.repeat(65) }), null);
});

test('clientIp prefers the ingress header, then the first forwarded address', () => {
	assert.equal(clientIp(new Headers({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })), '1.1.1.1');
	assert.equal(clientIp(new Headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' })), '2.2.2.2');
	assert.equal(clientIp(new Headers()), null);
});
