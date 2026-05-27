import type { BookEvent, BookEventOfType } from '../../game/typesBookEvent';

const triggerBoard: BookEventOfType<'reveal'>['board'] = [
	[{ name: 'H1' }, { name: 'L1' }, { name: 'H3' }],
	[
		{ name: 'COIN', value: 100 },
		{ name: 'COIN', value: 200 },
		{ name: 'COIN', value: 300 },
	],
	[{ name: 'H2' }, { name: 'L3' }, { name: 'L4' }],
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
	totalWin: 850,
	board: [
		[{ name: 'COIN', value: 250 }, { name: 'L1' }, { name: 'H3' }],
		triggerBoard[1],
		[{ name: 'H2' }, { name: 'L3' }, { name: 'L4' }],
	],
};

const bonusReveal2: BookEventOfType<'bonusReveal'> = {
	index: 3,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 2,
	coinsAdded: [],
	totalWin: 850,
	board: bonusReveal1.board,
};

const bonusReveal3: BookEventOfType<'bonusReveal'> = {
	index: 4,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 3,
	coinsAdded: [{ reel: 2, row: 2 }],
	totalWin: 1250,
	board: [
		bonusReveal1.board[0],
		triggerBoard[1],
		[{ name: 'H2' }, { name: 'L3' }, { name: 'COIN', value: 400 }],
	],
};

const bonusReveal4: BookEventOfType<'bonusReveal'> = {
	index: 5,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 2,
	coinsAdded: [],
	totalWin: 1250,
	board: bonusReveal3.board,
};

const bonusReveal5: BookEventOfType<'bonusReveal'> = {
	index: 6,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 1,
	coinsAdded: [],
	totalWin: 1250,
	board: bonusReveal3.board,
};

const bonusReveal6: BookEventOfType<'bonusReveal'> = {
	index: 7,
	type: 'bonusReveal',
	paddingPositions: [0, 0, 0],
	respins: 0,
	coinsAdded: [],
	totalWin: 1250,
	board: bonusReveal3.board,
};

const bonusEnd: BookEventOfType<'bonusEnd'> = {
	index: 8,
	type: 'bonusEnd',
	amount: 1250,
};

const setTotalWin: BookEventOfType<'setTotalWin'> = {
	index: 9,
	type: 'setTotalWin',
	amount: 1250,
};

const finalWin: BookEventOfType<'finalWin'> = {
	index: 10,
	type: 'finalWin',
	amount: 1250,
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
};
