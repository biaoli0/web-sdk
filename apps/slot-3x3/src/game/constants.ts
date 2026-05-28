import { COIN_SYMBOL_NAME_VALUES, REGULAR_SYMBOL_NAME_VALUES, SYMBOL_NAME } from './symbols';
import type { Position, RawSymbol, RegularSymbolName, SymbolName, SymbolState } from './types';

export const SYMBOL_WIDTH = 240;
export const SYMBOL_HEIGHT = 130;
export const BOARD_REELS = 3;
export const BOARD_ROWS = 3;
export const CENTRAL_REEL_INDEX = 1;
export const BONUS_RESPINS_DEFAULT = 3;
export const BOARD_GAP = 12;

export const BOARD_SIZES = {
	width: BOARD_REELS * SYMBOL_WIDTH + (BOARD_REELS - 1) * BOARD_GAP,
	height: BOARD_ROWS * SYMBOL_HEIGHT + (BOARD_ROWS - 1) * BOARD_GAP,
};

export const BOARD_DIMENSIONS = {
	x: BOARD_REELS,
	y: BOARD_ROWS,
};

export const REGULAR_SYMBOL_NAMES: RegularSymbolName[] = [...REGULAR_SYMBOL_NAME_VALUES];
export const SYMBOL_NAMES: SymbolName[] = [...REGULAR_SYMBOL_NAMES, ...COIN_SYMBOL_NAME_VALUES];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

export const SYMBOL_TEXTURE_MAP: Record<
	SymbolName,
	{ normal: string; dark: string; sizeRatios: { width: number; height: number } }
> = {
	[SYMBOL_NAME.HIGH_1]: {
		normal: 'seven.webp',
		dark: 'seven_dark.webp',
		sizeRatios: { width: 1.55, height: 0.94 },
	},
	[SYMBOL_NAME.HIGH_2]: {
		normal: 'star.webp',
		dark: 'star_dark.webp',
		sizeRatios: { width: 1.58, height: 0.94 },
	},
	[SYMBOL_NAME.HIGH_3]: {
		normal: 'bell.webp',
		dark: 'bell_dark.webp',
		sizeRatios: { width: 1.49, height: 0.94 },
	},
	[SYMBOL_NAME.HIGH_4]: {
		normal: 'watermelon.webp',
		dark: 'watermelon_dark.webp',
		sizeRatios: { width: 1.7, height: 0.94 },
	},
	[SYMBOL_NAME.LOW_1]: {
		normal: 'grapes.webp',
		dark: 'grapes_dark.webp',
		sizeRatios: { width: 1.57, height: 0.94 },
	},
	[SYMBOL_NAME.LOW_2]: {
		normal: 'plum.webp',
		dark: 'plum_dark.webp',
		sizeRatios: { width: 1.59, height: 0.94 },
	},
	[SYMBOL_NAME.LOW_3]: {
		normal: 'orange.webp',
		dark: 'orange_dark.webp',
		sizeRatios: { width: 1.63, height: 0.94 },
	},
	[SYMBOL_NAME.LOW_4]: {
		normal: 'bar_bar.webp',
		dark: 'bar_bar_dark.webp',
		sizeRatios: { width: 1.5, height: 0.94 },
	},
	[SYMBOL_NAME.VALUE_COIN]: {
		normal: 'feature_coin.webp',
		dark: 'feature_coin.webp',
		sizeRatios: { width: 1.1, height: 1.1 },
	},
	[SYMBOL_NAME.EMPTY_COIN]: {
		normal: 'coin.webp',
		dark: 'coin.webp',
		sizeRatios: { width: 1, height: 1 },
	},
};

export const INITIAL_BOARD: RawSymbol[][] = [
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_1 }, { name: SYMBOL_NAME.HIGH_3 }],
	[{ name: SYMBOL_NAME.HIGH_2 }, { name: SYMBOL_NAME.LOW_2 }, { name: SYMBOL_NAME.HIGH_4 }],
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_3 }, { name: SYMBOL_NAME.LOW_4 }],
];

export const PAYLINES: Record<string, [number, number, number]> = {
	'1': [0, 0, 0],
	'2': [1, 1, 1],
	'3': [2, 2, 2],
	'4': [0, 1, 2],
	'5': [2, 1, 0],
};

export const PAYLINE_POSITIONS: Record<string, Position[]> = Object.fromEntries(
	Object.entries(PAYLINES).map(([lineIndex, rows]) => [
		lineIndex,
		rows.map((row, reel) => ({ reel, row })),
	]),
) as Record<string, Position[]>;

const SPIN_OPTIONS_SHARED = {
	reelBounceBackSpeed: 0.15,
	reelSpinSpeedBeforeBounce: 4,
	reelPaddingMultiplierNormal: 1.2,
	reelPaddingMultiplierAnticipated: 6,
	reelSpinDelay: 110,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 2,
	reelSpinSpeed: 3,
	reelBounceSizeMulti: 0.24,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 5,
	reelSpinSpeed: 5,
	reelBounceSizeMulti: 0.05,
};

export const MAIN_SIZES = {
	desktop: { width: 1422, height: 800 },
	tablet: { width: 1000, height: 1000 },
	landscape: { width: 1600, height: 900 },
	portrait: { width: 800, height: 1422 },
};
