import type { Position, RawSymbol, SymbolName, SymbolState } from './types';

export const SYMBOL_SIZE = 130;
export const BOARD_REELS = 3;
export const BOARD_ROWS = 3;
export const BOARD_GAP = 12;

export const BOARD_SIZES = {
	width: BOARD_REELS * SYMBOL_SIZE + (BOARD_REELS - 1) * BOARD_GAP,
	height: BOARD_ROWS * SYMBOL_SIZE + (BOARD_ROWS - 1) * BOARD_GAP,
};

export const BOARD_DIMENSIONS = {
	x: BOARD_REELS,
	y: BOARD_ROWS,
};

export const SYMBOL_NAMES: SymbolName[] = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

export const SYMBOL_TEXTURE_MAP: Record<SymbolName, string> = {
	H1: 'h1.webp',
	H2: 'h2.webp',
	H3: 'h3.webp',
	H4: 'h4.webp',
	L1: 'l1.webp',
	L2: 'l2.webp',
	L3: 'l3.webp',
	L4: 'l4.webp',
};

export const INITIAL_BOARD: RawSymbol[][] = [
	[{ name: 'H1' }, { name: 'L1' }, { name: 'H3' }],
	[{ name: 'H2' }, { name: 'L2' }, { name: 'H4' }],
	[{ name: 'H1' }, { name: 'L3' }, { name: 'L4' }],
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
