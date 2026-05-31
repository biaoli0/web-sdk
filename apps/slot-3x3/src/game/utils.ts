import { createPlayBookUtils } from 'utils-book';
import { stateBet } from 'state-shared';

import { bookEventHandlerMap } from './bookEventHandlerMap';
import type { Bet } from './typesBookEvent';

export const { playBookEvent, playBookEvents } = createPlayBookUtils({ bookEventHandlerMap });

export const playBet = async (bet: Bet) => {
	stateBet.winBookEventAmount = 0;
	await playBookEvents(bet.state);
};
