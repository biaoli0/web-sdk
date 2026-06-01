import { type SpinningReelSymbolState } from 'utils-slots';

import { COIN_SYMBOL_NAME_VALUES, REGULAR_SYMBOL_NAME_VALUES, SYMBOL_NAME } from './symbols';

export type RegularSymbolName = (typeof REGULAR_SYMBOL_NAME_VALUES)[number];
export type ValueCoinSymbolName = typeof SYMBOL_NAME.VALUE_COIN;
export type CoinSymbolName = (typeof COIN_SYMBOL_NAME_VALUES)[number];
export type SymbolName = RegularSymbolName | CoinSymbolName;

export type RawSymbol =
	| {
			name: RegularSymbolName;
	  }
	| {
			name: ValueCoinSymbolName;
			multiplier: number;
			amount: number;
	  }
	| {
			name: typeof SYMBOL_NAME.EMPTY_COIN;
	  };

export type SymbolState = SpinningReelSymbolState;

export type Position = {
	reel: number;
	row: number;
};

export type GameType = 'basegame' | 'bonusgame';

export type BonusStatus = 'inactive' | 'active' | 'complete';

export type LineWin = {
	symbol: SymbolName;
	kind: 3;
	win: number;
	positions: Position[];
	meta: {
		lineIndex: number;
		multiplier: number;
		winWithoutMult: number;
		lineMultiplier: number;
	};
};

export type BonusState = {
	status: BonusStatus;
	introVisible: boolean;
	outroVisible: boolean;
	isSpinning: boolean;
	respins: number;
	totalWin: number;
	coinsAdded: Position[];
};
