import { createEnhanceBoard, createReelForSpinning } from 'utils-slots';

import {
	BOARD_GAP,
	INITIAL_BOARD,
	INITIAL_SYMBOL_STATE,
	SPIN_OPTIONS_FAST,
	SYMBOL_HEIGHT,
} from '../constants';
import { shouldHoldBonusRevealReel } from '../bonusRules';
import { eventEmitter } from '../eventEmitter';
import type { RawSymbol, SymbolState } from '../types';

type ReelControllerOptions = {
	isTurbo: () => boolean;
	normalSpinOptions: () => typeof SPIN_OPTIONS_FAST;
};

const symbolHeight = SYMBOL_HEIGHT + BOARD_GAP;

export const createReelController = ({ isTurbo, normalSpinOptions }: ReelControllerOptions) => {
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
					forcePlay: !isTurbo(),
				});
			},
			onSymbolLand: () => {},
		});

		reel.reelState.spinOptions = () =>
			reel.reelState.spinType === 'fast' ? SPIN_OPTIONS_FAST : normalSpinOptions();

		return reel;
	});

	const { enhanceBoard } = createEnhanceBoard();
	const enhancedBoard = enhanceBoard({ board });

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

		board.forEach((reel, reelIndex) => {
			if (shouldHoldBonusRevealReel(reelIndex)) {
				return;
			}

			previousPaddingSize = reel.prepareToSpin({
				noStop: false,
				spinType: isTurbo() ? 'fast' : 'normal',
				symbols: rawBoard[reelIndex],
				paddingReel: paddingBoard?.[reelIndex] ?? rawBoard[reelIndex],
				paddingPosition: paddingPositions?.[reelIndex] ?? 0,
				previousPaddingSize,
				onSpinFinishing: () => reel.onReelStopping(),
			});
		});

		await Promise.all(
			board.map((reel, reelIndex) =>
				shouldHoldBonusRevealReel(reelIndex) ? Promise.resolve() : reel.spin(),
			),
		);
	};

	return {
		board,
		enhancedBoard,
		spinBonusReveal,
	};
};
