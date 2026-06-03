import { stateBet, stateModal, stateSound } from 'state-shared';

import { INITIAL_BOARD, PAYLINE_POSITIONS } from '../game/constants';
import { SYMBOL_NAME } from '../game/symbols';
import { stateGame, stateGameDerived } from '../game/state/stateGame.svelte';
import { stateXstate } from '../game/state/stateXstate';
import type { LineWin, RawSymbol, SymbolName } from '../game/types';

export const resetSlot3x3StoryState = () => {
	stateGameDerived.clear();
	stateGameDerived.setReelSpeed(0);
	stateXstate.value = 'idle';

	stateBet.currency = 'USD';
	stateBet.balanceAmount = 10000;
	stateBet.betAmount = 1;
	stateBet.wageredBetAmount = 1;
	stateBet.betToResume = null;
	stateBet.activeBetModeKey = 'BASE';
	stateBet.winBookEventAmount = 0;
	stateBet.autoSpinsLoss = 0;
	stateBet.autoSpinsCounter = 0;
	stateBet.autoSpinsLossLimitAmount = Infinity;
	stateBet.autoSpinsSingleWinLimitAmount = Infinity;
	stateBet.isSpaceHold = false;
	stateBet.isTurbo = false;

	stateModal.modal = null;
	stateSound.volumeValueMaster = 75;
	stateSound.volumeValueMusic = 75;
	stateSound.volumeValueSoundEffect = 75;
};

export const rawSymbolFor = (name: SymbolName): RawSymbol => {
	if (name === SYMBOL_NAME.VALUE_COIN) {
		return { name, multiplier: 25, amount: 25 };
	}

	if (name === SYMBOL_NAME.EMPTY_COIN) {
		return { name };
	}

	return { name };
};

const createLineWin = ({
	symbol,
	win,
	lineIndex,
}: {
	symbol: SymbolName;
	win: number;
	lineIndex: keyof typeof PAYLINE_POSITIONS;
}): LineWin => ({
	symbol,
	kind: 3,
	win,
	positions: PAYLINE_POSITIONS[lineIndex],
	meta: {
		lineIndex: Number(lineIndex),
		multiplier: 1,
		winWithoutMult: win,
		lineMultiplier: 1,
	},
});

export const WIN_BOARD: RawSymbol[][] = [
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_1 }, { name: SYMBOL_NAME.HIGH_3 }],
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_2 }, { name: SYMBOL_NAME.HIGH_4 }],
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_3 }, { name: SYMBOL_NAME.LOW_4 }],
];

export const BONUS_BOARD: RawSymbol[][] = [
	[
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 10, amount: 10 },
		{ name: SYMBOL_NAME.EMPTY_COIN },
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 15, amount: 15 },
	],
	[
		{ name: SYMBOL_NAME.EMPTY_COIN },
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 50, amount: 50 },
		{ name: SYMBOL_NAME.EMPTY_COIN },
	],
	[
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 20, amount: 20 },
		{ name: SYMBOL_NAME.EMPTY_COIN },
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 25, amount: 25 },
	],
];

export const setupReadyBoardStory = () => {
	resetSlot3x3StoryState();
	stateGameDerived.settle(INITIAL_BOARD);
};

export const setupWinningBoardStory = () => {
	resetSlot3x3StoryState();
	stateGameDerived.settle(WIN_BOARD);
	stateGameDerived.setWinInfo({
		totalWin: 500,
		wins: [
			createLineWin({
				symbol: SYMBOL_NAME.HIGH_1,
				win: 500,
				lineIndex: '1',
			}),
		],
	});
	stateBet.winBookEventAmount = 500;
};

export const setupMoneyStory = () => {
	resetSlot3x3StoryState();
	stateBet.balanceAmount = 12345.67;
	stateBet.betAmount = 25;
	stateBet.wageredBetAmount = 25;
	stateBet.winBookEventAmount = 320;
};

export const setupBonusActiveStory = () => {
	resetSlot3x3StoryState();
	stateGameDerived.settle(BONUS_BOARD);
	stateGameDerived.startBonus({
		positions: [
			{ reel: 0, row: 0 },
			{ reel: 1, row: 1 },
			{ reel: 2, row: 2 },
		],
		respins: 3,
	});
};

export const setupBonusIntroStory = () => {
	setupBonusActiveStory();
	stateGame.bonus.introVisible = true;
};

export const setupBonusOutroStory = () => {
	resetSlot3x3StoryState();
	stateGameDerived.settle(BONUS_BOARD);
	stateGame.gameType = 'bonusgame';
	stateGameDerived.completeBonus({ amount: 2500 });
};

export const setupAutoSpinControlsStory = () => {
	resetSlot3x3StoryState();
	stateBet.autoSpinsCounter = 25;
};

export const setupSettingsModalStory = () => {
	resetSlot3x3StoryState();
	stateModal.modal = { name: 'settings' };
};

export const setupBetMenuModalStory = () => {
	resetSlot3x3StoryState();
	stateModal.modal = { name: 'betAmountMenu' };
};
