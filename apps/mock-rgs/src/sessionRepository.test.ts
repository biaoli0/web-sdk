import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { SessionRepository } from './sessionRepository';

type TestSession = {
	sessionID: string;
	balance: number;
	activeRound: {
		state: object[];
	} | null;
	lastRound: {
		state: object[];
	} | null;
	activeBonusSequence: {
		nextEventIndex: number;
	} | null;
};

test('persists resumable session state', () => {
	const directory = mkdtempSync(join(tmpdir(), 'mock-rgs-sessions-'));
	const filePath = join(directory, 'sessions.json');

	try {
		const repository = new SessionRepository<TestSession>({ filePath });
		const session: TestSession = {
			sessionID: 'slot-3x3-local',
			balance: 999,
			activeRound: {
				state: [{ index: 1, type: 'bonusTrigger' }],
			},
			lastRound: null,
			activeBonusSequence: {
				nextEventIndex: 3,
			},
		};

		repository.set(session);

		const reloadedSession = new SessionRepository<TestSession>({ filePath }).get(session.sessionID);
		assert.deepEqual(reloadedSession, session);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
