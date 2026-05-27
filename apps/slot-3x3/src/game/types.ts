import { type SpinningReelSymbolState } from 'utils-slots';

export type RegularSymbolName = 'H1' | 'H2' | 'H3' | 'H4' | 'L1' | 'L2' | 'L3' | 'L4';
export type SymbolName = RegularSymbolName | 'COIN';

export type RawSymbol =
	| {
			name: RegularSymbolName;
	  }
	| {
			name: 'COIN';
			value: number;
	  };

export type SymbolState = SpinningReelSymbolState;

export type Position = {
	reel: number;
	row: number;
};

export type GameType = 'basegame' | 'bonusgame';

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
