import { stateBet } from 'state-shared';
import type { BookEventHandlerMap } from 'utils-book';
import { waitForTimeout } from 'utils-shared/wait';

import { BOARD_REELS } from './constants';
import config from './config';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventContext, BookEventOfType } from './typesBookEvent';

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>) => {
		stateGame.gameType = bookEvent.gameType;
		await stateGameDerived.enhancedBoard.spin({
			revealEvent: {
				...bookEvent,
				anticipation: Array(BOARD_REELS).fill(0),
			},
			paddingBoard: config.paddingReels[bookEvent.gameType],
		});
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		stateGameDerived.setWinInfo(bookEvent);
		stateBet.winBookEventAmount = bookEvent.totalWin;
		await waitForTimeout(bookEvent.wins.length > 0 ? 450 : 120);
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateGame.totalWin = bookEvent.amount;
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		stateGame.finalWin = bookEvent.amount;
		stateBet.winBookEventAmount = bookEvent.amount;
	},
};
