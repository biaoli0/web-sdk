import { stateBet } from 'state-shared';
import type { BookEventHandlerMap } from 'utils-book';
import { waitForTimeout } from 'utils-shared/wait';

import { BOARD_REELS } from './constants';
import config from './config';
import { eventEmitter } from './eventEmitter';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventContext, BookEventOfType } from './typesBookEvent';

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>) => {
		stateGame.gameType = bookEvent.gameType;
		stateGame.bonus.coinsAdded = [];
		await stateGameDerived.enhancedBoard.spin({
			revealEvent: {
				...bookEvent,
				anticipation: Array(BOARD_REELS).fill(0),
			},
			paddingBoard: config.paddingReels[bookEvent.gameType],
		});
	},
	bonusTrigger: async (bookEvent: BookEventOfType<'bonusTrigger'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		stateGame.bonus.introVisible = true;
		await waitForTimeout(1500);
		stateGame.bonus.introVisible = false;
		stateGameDerived.startBonus({
			positions: bookEvent.positions,
			respins: bookEvent.respins,
		});
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		stateBet.winBookEventAmount = stateGame.bonus.totalWin;
	},
	bonusReveal: async (bookEvent: BookEventOfType<'bonusReveal'>) => {
		await stateGameDerived.spinBonusReveal({
			rawBoard: bookEvent.board,
			paddingBoard: config.paddingReels.bonusgame,
			paddingPositions: bookEvent.paddingPositions,
		});
		stateGameDerived.updateBonus({
			respins: bookEvent.respins,
			coinsAdded: bookEvent.coinsAdded,
			totalWin: bookEvent.totalWin,
		});
		if (bookEvent.coinsAdded.length > 0) {
			eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_symbols_landing' });
		}
		stateBet.winBookEventAmount = bookEvent.totalWin;
		await waitForTimeout(bookEvent.coinsAdded.length > 0 ? 450 : 180);
	},
	bonusEnd: async (bookEvent: BookEventOfType<'bonusEnd'>) => {
		stateGameDerived.completeBonus({ amount: bookEvent.amount });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
		await waitForTimeout(600);
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		stateGameDerived.setWinInfo(bookEvent);
		if (bookEvent.wins.length > 0) {
			eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
		}
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
