import { createEnhanceBoard, createReelForSpinning } from 'utils-slots';
import { stateBet } from 'state-shared';

import {
	BOARD_GAP,
	BONUS_RESPINS_DEFAULT,
	CENTRAL_REEL_INDEX,
	INITIAL_BOARD,
	INITIAL_SYMBOL_STATE,
	SPIN_OPTIONS_DEFAULT,
	SPIN_OPTIONS_FAST,
	SYMBOL_HEIGHT,
} from './constants';
import { SYMBOL_NAME } from './symbols';
import {
	type BonusState,
	type GameType,
	type LineWin,
	type Position,
	type RawSymbol,
	type SymbolState,
} from './types';
import { eventEmitter } from './eventEmitter';

const symbolHeight = SYMBOL_HEIGHT + BOARD_GAP;

const createInitialBonusState = (): BonusState => ({
	status: 'inactive',
	introVisible: false,
	respins: 0,
	totalWin: 0,
	coinsAdded: [],
});

const board = INITIAL_BOARD.map((initialSymbols, reelIndex) => {
	const reel = createReelForSpinning<RawSymbol, SymbolState>({
		reelIndex,
		symbolHeight,
		initialSymbols,
		initialSymbolState: INITIAL_SYMBOL_STATE,
		onReelStopping: () => {
			eventEmitter.broadcast({
				type: 'soundOnce',
				name: 'sfx_reel_stop_1',
				forcePlay: !stateBet.isTurbo,
			});
		},
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
	bonus: createInitialBonusState(),
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

const resetWinInfo = () => {
	stateGame.wins = [];
	stateGame.totalWin = 0;
	stateGame.finalWin = 0;
};

const clear = () => {
	settle();
	resetWinInfo();
	stateGame.gameType = 'basegame';
	stateGame.bonus = createInitialBonusState();
};

const isSpinning = () => stateGame.board.some((reel) => reel.reelState.motion !== 'stopped');

const visibleSymbolY = (reelSymbol: ReelSymbol) =>
	reelSymbol.symbolY() + SYMBOL_HEIGHT + BOARD_GAP * 0.5;

const boardRaw = () =>
	stateGame.board.map((reel) => reel.reelState.symbols.map((reelSymbol) => reelSymbol.rawSymbol));

const sumCoinValues = (rawBoard: RawSymbol[][]) =>
	rawBoard.reduce(
		(total, reel) =>
			total +
			reel.reduce(
				(reelTotal, rawSymbol) =>
					reelTotal + (rawSymbol.name === SYMBOL_NAME.VALUE_COIN ? rawSymbol.value : 0),
				0,
			),
		0,
	);

const isSamePosition = (left: Position, right: Position) =>
	left.reel === right.reel && left.row === right.row;

const isBonusNewCoinPosition = (position: Position) =>
	stateGame.bonus.coinsAdded.some((coinPosition) => isSamePosition(coinPosition, position));

const startBonus = ({
	positions,
	respins = BONUS_RESPINS_DEFAULT,
}: {
	positions: Position[];
	respins?: number;
}) => {
	const currentBoard = boardRaw();

	stateGame.gameType = 'bonusgame';
	stateGame.bonus.status = 'active';
	stateGame.bonus.introVisible = false;
	stateGame.bonus.respins = respins;
	stateGame.bonus.coinsAdded = positions;
	stateGame.bonus.totalWin = sumCoinValues(currentBoard);
};

const updateBonus = ({
	respins,
	coinsAdded,
	totalWin,
}: {
	respins: number;
	coinsAdded: Position[];
	totalWin: number;
}) => {
	stateGame.gameType = 'bonusgame';
	stateGame.bonus.status = 'active';
	stateGame.bonus.introVisible = false;
	stateGame.bonus.respins = respins;
	stateGame.bonus.coinsAdded = coinsAdded;
	stateGame.bonus.totalWin = totalWin;
};

const completeBonus = ({ amount }: { amount: number }) => {
	stateGame.bonus.status = 'complete';
	stateGame.bonus.introVisible = false;
	stateGame.bonus.respins = 0;
	stateGame.bonus.coinsAdded = [];
	stateGame.bonus.totalWin = amount;
	stateGame.totalWin = amount;
	stateGame.finalWin = amount;
	stateBet.winBookEventAmount = amount;
};

const spinBonusReveal = async ({
	rawBoard,
	paddingBoard,
	paddingPositions,
}: {
	rawBoard: RawSymbol[][];
	paddingBoard?: RawSymbol[][];
	paddingPositions?: number[];
}) => {
	let previousPaddingSize = 0;

	stateGame.board.forEach((reel, reelIndex) => {
		if (reelIndex === CENTRAL_REEL_INDEX) {
			return;
		}

		previousPaddingSize = reel.prepareToSpin({
			noStop: false,
			spinType: stateBet.isTurbo ? 'fast' : 'normal',
			symbols: rawBoard[reelIndex],
			paddingReel: paddingBoard?.[reelIndex] ?? rawBoard[reelIndex],
			paddingPosition: paddingPositions?.[reelIndex] ?? 0,
			previousPaddingSize,
			onSpinFinishing: () => reel.onReelStopping(),
		});
	});

	await Promise.all(
		stateGame.board.map((reel, reelIndex) =>
			reelIndex === CENTRAL_REEL_INDEX ? Promise.resolve() : reel.spin(),
		),
	);
};

export const stateGameDerived = {
	enhancedBoard,
	settle,
	setWinInfo,
	resetWinInfo,
	clear,
	isSpinning,
	visibleSymbolY,
	boardRaw,
	sumCoinValues,
	isBonusNewCoinPosition,
	startBonus,
	updateBonus,
	completeBonus,
	spinBonusReveal,
};
