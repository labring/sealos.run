import assert from 'node:assert/strict';
import test from 'node:test';
import { clientIp, hashIp, parseVoteRequest, parseVoterId } from './vote-request.ts';

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

test('hashIp is stable per salt and does not contain the address', () => {
	assert.equal(hashIp('1.1.1.1', 's'), hashIp('1.1.1.1', 's'));
	assert.notEqual(hashIp('1.1.1.1', 's'), hashIp('1.1.1.1', 't'));
	assert.notEqual(hashIp('1.1.1.1', 's'), hashIp('1.1.1.2', 's'));
	assert.doesNotMatch(hashIp('1.1.1.1', 's'), /1\.1\.1\.1/);
});

test('parseVoterId accepts only a UUID', () => {
	const uuid = 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643';
	assert.equal(parseVoterId(uuid), uuid);
	assert.equal(parseVoterId(uuid.toUpperCase()), uuid);
	for (const bad of [undefined, '', 'abc', `${uuid}x`, "x'; drop table showcase_votes;--"]) {
		assert.equal(parseVoterId(bad), null);
	}
});
