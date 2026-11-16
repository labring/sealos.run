import assert from 'node:assert/strict';
import test from 'node:test';
import { parseVoteRequest, parseVoterId } from './vote-request.ts';

test('parseVoteRequest accepts only a known project id', () => {
	assert.deepEqual(parseVoteRequest({ projectId: 'a' }, ['a', 'b']), { projectId: 'a' });
	for (const bad of [null, undefined, 'a', {}, { projectId: 1 }, { projectId: 'zzz' }, [], ['a']]) {
		assert.equal(parseVoteRequest(bad, ['a', 'b']), null);
	}
});

test('parseVoterId accepts only a UUID', () => {
	const uuid = 'c85cd505-fb10-4ff9-a8f4-4ba89fbe6643';
	assert.equal(parseVoterId(uuid), uuid);
	assert.equal(parseVoterId(uuid.toUpperCase()), uuid);
	for (const bad of [undefined, '', 'abc', `${uuid}x`, "x'; drop table showcase_votes;--"]) {
		assert.equal(parseVoterId(bad), null);
	}
});
