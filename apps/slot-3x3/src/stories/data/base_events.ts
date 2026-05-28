import { SYMBOL_NAME } from '../../game/symbols';
import type { BookEventOfType } from '../../game/typesBookEvent';

const reveal: BookEventOfType<'reveal'> = {
	index: 0,
	type: 'reveal',
	gameType: 'basegame',
	paddingPositions: [0, 0, 0],
	board: [
		[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_1 }, { name: SYMBOL_NAME.HIGH_3 }],
		[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_2 }, { name: SYMBOL_NAME.HIGH_4 }],
		[{ name: SYMBOL_NAME.HIGH_1 }, { name: SYMBOL_NAME.LOW_3 }, { name: SYMBOL_NAME.LOW_4 }],
	],
};

const winInfo: BookEventOfType<'winInfo'> = {
	index: 1,
	type: 'winInfo',
	totalWin: 25,
	wins: [
		{
			symbol: SYMBOL_NAME.HIGH_1,
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
