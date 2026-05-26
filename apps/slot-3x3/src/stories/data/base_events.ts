import type { BookEventOfType } from '../../game/typesBookEvent';

const reveal: BookEventOfType<'reveal'> = {
	index: 0,
	type: 'reveal',
	gameType: 'basegame',
	paddingPositions: [0, 0, 0],
	board: [
		[{ name: 'H1' }, { name: 'L1' }, { name: 'H3' }],
		[{ name: 'H1' }, { name: 'L2' }, { name: 'H4' }],
		[{ name: 'H1' }, { name: 'L3' }, { name: 'L4' }],
	],
};

const winInfo: BookEventOfType<'winInfo'> = {
	index: 1,
	type: 'winInfo',
	totalWin: 25,
	wins: [
		{
			symbol: 'H1',
			kind: 3,
			win: 25,
			positions: [
				{ reel: 0, row: 0 },
				{ reel: 1, row: 0 },
				{ reel: 2, row: 0 },
			],
			meta: {
				lineIndex: 1,
				multiplier: 1,
				winWithoutMult: 25,
				lineMultiplier: 1,
			},
		},
	],
};

const setTotalWin: BookEventOfType<'setTotalWin'> = {
	index: 2,
	type: 'setTotalWin',
	amount: 25,
};

const finalWin: BookEventOfType<'finalWin'> = {
	index: 3,
	type: 'finalWin',
	amount: 25,
};

export default {
	reveal,
	winInfo,
	setTotalWin,
	finalWin,
};
