import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('returns the last completed base round on authenticate', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'mock-rgs-completed-round-'));
	process.env.MOCK_RGS_SESSION_STORE_PATH = join(directory, 'sessions.json');

	try {
		const { authenticateSession, endRound, play } = await import('./sessions');
		const request = {
			sessionID: 'slot-3x3-local',
			amount: 1000000,
			currency: 'USD',
			mode: 'BASE',
		};

		play(request);
		const winningPlay = play(request);
		assert.equal(winningPlay.round.active, true);

		endRound({ sessionID: request.sessionID });

		const resumedRound = authenticateSession({ sessionID: request.sessionID }).round;
		assert.equal(resumedRound?.roundID, winningPlay.round.roundID);
		assert.equal(resumedRound?.active, false);
		assert.deepEqual(resumedRound?.state, winningPlay.round.state);
	} finally {
		delete process.env.MOCK_RGS_SESSION_STORE_PATH;
		rmSync(directory, { recursive: true, force: true });
	}
});
