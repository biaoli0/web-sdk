import { stateBet } from 'state-shared';

import { waitForManualBonusRound } from './actors/bonusFlowActor';
import { playBookEvent, playBookEvents } from './bookPlayback';
import type { Bet } from './typesBookEvent';

export { playBookEvent, playBookEvents };

export const playBet = async (bet: Bet) => {
	stateBet.winBookEventAmount = 0;
	await playBookEvents(bet.state);
	await waitForManualBonusRound(bet.state);
};
