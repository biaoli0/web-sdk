import { createEnhanceBoard, createReelForSpinning } from 'utils-slots';

import {
	BOARD_GAP,
	INITIAL_BOARD,
	INITIAL_SYMBOL_STATE,
	SPIN_OPTIONS_DEFAULT,
	SPIN_OPTIONS_FAST,
	SYMBOL_SIZE,
} from './constants';
import type { GameType, LineWin, RawSymbol, SymbolState } from './types';

const symbolHeight = SYMBOL_SIZE + BOARD_GAP;

const board = INITIAL_BOARD.map((initialSymbols, reelIndex) => {
	const reel = createReelForSpinning<RawSymbol, SymbolState>({
		reelIndex,
		symbolHeight,
		initialSymbols,
		initialSymbolState: INITIAL_SYMBOL_STATE,
		onReelStopping: () => {},
		onSymbolLand: () => {},
	});

	reel.reelState.spinOptions = () =>
		reel.reelState.spinType === 'fast' ? SPIN_OPTIONS_FAST : SPIN_OPTIONS_DEFAULT;

	return reel;
});

export type Reel = (typeof board)[number];
export type ReelSymbol = Reel['reelState']['symbols'][number];

export const stateGame = $state({
	board,
	gameType: 'basegame' as GameType,
	totalWin: 0,
	finalWin: 0,
	wins: [] as LineWin[],
});

const { enhanceBoard } = createEnhanceBoard();
const enhancedBoard = enhanceBoard({ board: stateGame.board });

const settle = (boardToSettle: RawSymbol[][] = INITIAL_BOARD) => {
	enhancedBoard.settle(boardToSettle);
};

const setWinInfo = (bookEvent: { totalWin: number; wins: LineWin[] }) => {
	stateGame.totalWin = bookEvent.totalWin;
	stateGame.wins = bookEvent.wins;
};

const clear = () => {
	settle();
	stateGame.wins = [];
	stateGame.totalWin = 0;
	stateGame.finalWin = 0;
};

const isSpinning = () => stateGame.board.some((reel) => reel.reelState.motion !== 'stopped');

const visibleSymbolY = (reelSymbol: ReelSymbol) =>
	reelSymbol.symbolY() + SYMBOL_SIZE + BOARD_GAP * 0.5;

export const stateGameDerived = {
	enhancedBoard,
	settle,
	setWinInfo,
	clear,
	isSpinning,
	visibleSymbolY,
};
