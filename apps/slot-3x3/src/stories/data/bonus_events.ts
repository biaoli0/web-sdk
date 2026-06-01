import { SYMBOL_NAME } from '../../game/symbols';
import type { BookEvent, BookEventOfType } from '../../game/typesBookEvent';

const triggerBoard: BookEventOfType<'reveal'>['board'] = [
	[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_1 }, { name: SYMBOL_NAME.HIGH_3 }],
	[
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 1, amount: 1 },
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 2, amount: 2 },
		{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 3, amount: 3 },
	],
	[{ name: SYMBOL_NAME.HIGH_2 }, { name: SYMBOL_NAME.LOW_3 }, { name: SYMBOL_NAME.LOW_4 }],
];

const reveal: BookEventOfType<'reveal'> = {
	index: 0,
	type: 'reveal',
	gameType: 'basegame',
	paddingPositions: [0, 0, 0],
	board: triggerBoard,
};

const bonusTrigger: BookEventOfType<'bonusTrigger'> = {
	index: 1,
	type: 'bonusTrigger',
	respins: 3,
	positions: [
		{ reel: 1, row: 0 },
		{ reel: 1, row: 1 },
		{ reel: 1, row: 2 },
	],
};

const bonusReveal1: BookEventOfType<'bonusReveal'> = {
	index: 2,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 3,
	coinsAdded: [{ reel: 0, row: 0 }],
	totalWin: 14.5,
	board: [
		[
			{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 2.5, amount: 2.5 },
			{ name: SYMBOL_NAME.EMPTY_COIN },
			{ name: SYMBOL_NAME.EMPTY_COIN },
		],
		triggerBoard[1],
		[
			{ name: SYMBOL_NAME.EMPTY_COIN },
			{ name: SYMBOL_NAME.EMPTY_COIN },
			{ name: SYMBOL_NAME.EMPTY_COIN },
		],
	],
};

const createEmptyCoinReel = () => [
	{ name: SYMBOL_NAME.EMPTY_COIN },
	{ name: SYMBOL_NAME.EMPTY_COIN },
	{ name: SYMBOL_NAME.EMPTY_COIN },
];

const createNoSideCoinsBoard = (): BookEventOfType<'bonusReveal'>['board'] => [
	createEmptyCoinReel(),
	triggerBoard[1],
	createEmptyCoinReel(),
];

const bonusReveal2: BookEventOfType<'bonusReveal'> = {
	index: 3,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 2,
	coinsAdded: [],
	totalWin: 14.5,
	board: createNoSideCoinsBoard(),
};

const bonusReveal3: BookEventOfType<'bonusReveal'> = {
	index: 4,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 3,
	coinsAdded: [{ reel: 2, row: 2 }],
	totalWin: 24.5,
	board: [
		createEmptyCoinReel(),
		triggerBoard[1],
		[
			{ name: SYMBOL_NAME.EMPTY_COIN },
			{ name: SYMBOL_NAME.EMPTY_COIN },
			{ name: SYMBOL_NAME.VALUE_COIN, multiplier: 4, amount: 4 },
		],
	],
};

const bonusReveal4: BookEventOfType<'bonusReveal'> = {
	index: 5,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 2,
	coinsAdded: [],
	totalWin: 24.5,
	board: createNoSideCoinsBoard(),
};

const bonusReveal5: BookEventOfType<'bonusReveal'> = {
	index: 6,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 1,
	coinsAdded: [],
	totalWin: 24.5,
	board: createNoSideCoinsBoard(),
};

const bonusReveal6: BookEventOfType<'bonusReveal'> = {
	index: 7,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 0,
	coinsAdded: [],
	totalWin: 24.5,
	board: createNoSideCoinsBoard(),
};

const bonusEnd: BookEventOfType<'bonusEnd'> = {
	index: 8,
	type: 'bonusEnd',
	amount: 24.5,
};

const setTotalWin: BookEventOfType<'setTotalWin'> = {
	index: 9,
	type: 'setTotalWin',
	amount: 24.5,
};

const finalWin: BookEventOfType<'finalWin'> = {
	index: 10,
	type: 'finalWin',
	amount: 24.5,
};

const sequence: BookEvent[] = [
	reveal,
	bonusTrigger,
	bonusReveal1,
	bonusReveal2,
	bonusReveal3,
	bonusReveal4,
	bonusReveal5,
	bonusReveal6,
	bonusEnd,
	setTotalWin,
	finalWin,
];

const bonusSlices: BookEvent[][] = [
	[bonusReveal1],
	[bonusReveal2],
	[bonusReveal3],
	[bonusReveal4],
	[bonusReveal5],
	[bonusReveal6, bonusEnd],
];

export default {
	reveal,
	bonusTrigger,
	bonusReveal1,
	bonusReveal2,
	bonusReveal3,
	bonusReveal4,
	bonusReveal5,
	bonusReveal6,
	bonusEnd,
	setTotalWin,
	finalWin,
	sequence,
	bonusSlices,
};
