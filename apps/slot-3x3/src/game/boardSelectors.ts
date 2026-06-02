import { BOARD_GAP, SYMBOL_HEIGHT } from './constants';
import { SYMBOL_NAME } from './symbols';
import type { RawSymbol } from './types';
import type { createReelController } from './reelController';

type Board = ReturnType<typeof createReelController>['board'];
export type Reel = Board[number];
export type ReelSymbol = Reel['reelState']['symbols'][number];

export const createBoardSelectors = ({ board }: { board: Board }) => {
	const isSpinning = () => board.some((reel) => reel.reelState.motion !== 'stopped');

	const visibleSymbolY = (reelSymbol: ReelSymbol) =>
		reelSymbol.symbolY() + SYMBOL_HEIGHT + BOARD_GAP * 0.5;

	const boardRaw = () =>
		board.map((reel) => reel.reelState.symbols.map((reelSymbol) => reelSymbol.rawSymbol));

	const sumCoinValues = (rawBoard: RawSymbol[][]) =>
		rawBoard.reduce(
			(total, reel) =>
				total +
				reel.reduce(
					(reelTotal, rawSymbol) =>
						reelTotal + (rawSymbol.name === SYMBOL_NAME.VALUE_COIN ? rawSymbol.amount : 0),
					0,
				),
			0,
		);

	return {
		isSpinning,
		visibleSymbolY,
		boardRaw,
		sumCoinValues,
	};
};
