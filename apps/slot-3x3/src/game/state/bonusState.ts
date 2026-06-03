import { stateBet } from 'state-shared';

import { BONUS_RESPINS_DEFAULT } from '../constants';
import type { BonusState, GameType, LineWin, Position, RawSymbol } from '../types';

type BonusStateContainer = {
	gameType: GameType;
	totalWin: number;
	finalWin: number;
	wins: LineWin[];
	bonus: BonusState;
};

type BonusStateControllerOptions = {
	state: BonusStateContainer;
	isSpinning: () => boolean;
	boardRaw: () => RawSymbol[][];
	sumCoinValues: (rawBoard: RawSymbol[][]) => number;
};

export const createInitialBonusState = (): BonusState => ({
	status: 'inactive',
	introVisible: false,
	outroVisible: false,
	isSpinning: false,
	respins: 0,
	totalWin: 0,
	coinsAdded: [],
});

const isSamePosition = (left: Position, right: Position) =>
	left.reel === right.reel && left.row === right.row;

export const createBonusStateController = ({
	state,
	isSpinning,
	boardRaw,
	sumCoinValues,
}: BonusStateControllerOptions) => {
	const resetBonus = () => {
		state.bonus = createInitialBonusState();
	};

	const canBonusSpin = () =>
		state.bonus.status === 'active' &&
		!state.bonus.introVisible &&
		!state.bonus.isSpinning &&
		state.bonus.respins > 0 &&
		!isSpinning();

	const isBonusNewCoinPosition = (position: Position) =>
		state.bonus.coinsAdded.some((coinPosition) => isSamePosition(coinPosition, position));

	const startBonus = ({
		positions,
		respins = BONUS_RESPINS_DEFAULT,
	}: {
		positions: Position[];
		respins?: number;
	}) => {
		const currentBoard = boardRaw();

		state.gameType = 'bonusgame';
		state.bonus.status = 'active';
		state.bonus.introVisible = false;
		state.bonus.outroVisible = false;
		state.bonus.isSpinning = false;
		state.bonus.respins = respins;
		state.bonus.coinsAdded = positions;
		state.bonus.totalWin = sumCoinValues(currentBoard);
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
		state.gameType = 'bonusgame';
		state.bonus.status = 'active';
		state.bonus.introVisible = false;
		state.bonus.outroVisible = false;
		state.bonus.isSpinning = false;
		state.bonus.respins = respins;
		state.bonus.coinsAdded = coinsAdded;
		state.bonus.totalWin = totalWin;
	};

	const completeBonus = ({ amount }: { amount: number }) => {
		state.bonus.status = 'complete';
		state.bonus.introVisible = false;
		state.bonus.outroVisible = true;
		state.bonus.isSpinning = false;
		state.bonus.respins = 0;
		state.bonus.coinsAdded = [];
		state.bonus.totalWin = amount;
		state.totalWin = amount;
		state.finalWin = amount;
		stateBet.winBookEventAmount = amount;
	};

	return {
		resetBonus,
		canBonusSpin,
		isBonusNewCoinPosition,
		startBonus,
		updateBonus,
		completeBonus,
	};
};
