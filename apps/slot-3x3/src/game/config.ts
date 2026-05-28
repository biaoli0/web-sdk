import { PAYLINES, REGULAR_SYMBOL_NAMES } from './constants';
import { SYMBOL_NAME } from './symbols';

const paddingReel = REGULAR_SYMBOL_NAMES.map((name) => ({ name }));
const bonusPaddingReel = REGULAR_SYMBOL_NAMES.map(() => ({ name: SYMBOL_NAME.EMPTY_COIN }));

export default {
	providerName: 'x_provider',
	gameName: 'slot_3x3',
	gameID: 'slot_3x3',
	rtp: 0.97,
	numReels: 3,
	numRows: [3, 3, 3],
	betModes: {
		base: {
			cost: 1,
			feature: false,
			buyBonus: false,
			rtp: 0.97,
			max_win: 5000,
		},
	},
	paylines: PAYLINES,
	symbols: {
		[SYMBOL_NAME.HIGH_1]: { paytable: [{ '3': 50 }] },
		[SYMBOL_NAME.HIGH_2]: { paytable: [{ '3': 30 }] },
		[SYMBOL_NAME.HIGH_3]: { paytable: [{ '3': 20 }] },
		[SYMBOL_NAME.HIGH_4]: { paytable: [{ '3': 16 }] },
		[SYMBOL_NAME.LOW_1]: { paytable: [{ '3': 16 }] },
		[SYMBOL_NAME.LOW_2]: { paytable: [{ '3': 4 }] },
		[SYMBOL_NAME.LOW_3]: { paytable: [{ '3': 4 }] },
		[SYMBOL_NAME.LOW_4]: { paytable: [{ '3': 1 }] },
	},
	paddingReels: {
		basegame: [paddingReel, paddingReel, paddingReel],
		bonusgame: [bonusPaddingReel, bonusPaddingReel, bonusPaddingReel],
	},
};
