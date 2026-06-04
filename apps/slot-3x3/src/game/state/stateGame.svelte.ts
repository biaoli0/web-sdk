import { INITIAL_BOARD } from '../constants';
import type { GameType, LineWin, RawSymbol } from '../types';
import { createBoardSelectors, type Reel, type ReelSymbol } from './boardSelectors';
import { createBonusStateController, createInitialBonusState } from './bonusState';
import { createReelController } from './reelController';
import { createReelSpeedController, type ReelSpeedState } from './reelSpeed';

let reelSpeedState: ReelSpeedState;
const reelSpeed = createReelSpeedController(() => reelSpeedState);
const reelController = createReelController({
	isTurbo: reelSpeed.isTurbo,
	normalSpinOptions: reelSpeed.normalSpinOptions,
});

export type { Reel, ReelSymbol };

export const stateGame = $state({
	board: reelController.board,
	gameType: 'basegame' as GameType,
	totalWin: 0,
	finalWin: 0,
	wins: [] as LineWin[],
	reelSpeed: 0,
	reelSpeedBeforeTurbo: 0,
	bonus: createInitialBonusState(),
});

reelSpeedState = stateGame;
const boardSelectors = createBoardSelectors({ board: stateGame.board });
const bonusState = createBonusStateController({
	state: stateGame,
	isSpinning: boardSelectors.isSpinning,
	boardRaw: boardSelectors.boardRaw,
	sumCoinValues: boardSelectors.sumCoinValues,
});

const settle = (boardToSettle: RawSymbol[][] = INITIAL_BOARD) => {
	reelController.enhancedBoard.settle(boardToSettle);
};

const setWinInfo = (bookEvent: { totalWin: number; wins: LineWin[] }) => {
	stateGame.totalWin = bookEvent.totalWin;
	stateGame.wins = bookEvent.wins;
};

const resetWinInfo = () => {
	stateGame.wins = [];
	stateGame.totalWin = 0;
	stateGame.finalWin = 0;
};

const clear = () => {
	settle();
	resetWinInfo();
	stateGame.gameType = 'basegame';
	bonusState.resetBonus();
};

export const boardGameDerived = {
	enhancedBoard: reelController.enhancedBoard,
	settle,
	isSpinning: boardSelectors.isSpinning,
	visibleSymbolY: boardSelectors.visibleSymbolY,
	boardRaw: boardSelectors.boardRaw,
	sumCoinValues: boardSelectors.sumCoinValues,
	spinBonusReveal: reelController.spinBonusReveal,
};

export const winGameDerived = {
	setWinInfo,
	resetWinInfo,
	clear,
};

export const reelSpeedGameDerived = {
	isTurbo: reelSpeed.isTurbo,
	setReelSpeed: reelSpeed.setReelSpeed,
	setTurbo: reelSpeed.setTurbo,
	toggleTurbo: reelSpeed.toggleTurbo,
	normalSpinOptions: reelSpeed.normalSpinOptions,
};

export const bonusGameDerived = {
	canBonusSpin: bonusState.canBonusSpin,
	isBonusNewCoinPosition: bonusState.isBonusNewCoinPosition,
	startBonus: bonusState.startBonus,
	updateBonus: bonusState.updateBonus,
	completeBonus: bonusState.completeBonus,
};

export const stateGameDerived = {
	...boardGameDerived,
	...winGameDerived,
	...reelSpeedGameDerived,
	...bonusGameDerived,
};
