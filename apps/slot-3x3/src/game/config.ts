import { PAYLINES, REGULAR_SYMBOL_NAMES } from './constants';

const paddingReel = REGULAR_SYMBOL_NAMES.map((name) => ({ name }));

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
		H1: { paytable: [{ '3': 50 }] },
		H2: { paytable: [{ '3': 30 }] },
		H3: { paytable: [{ '3': 20 }] },
		H4: { paytable: [{ '3': 16 }] },
		L1: { paytable: [{ '3': 16 }] },
		L2: { paytable: [{ '3': 4 }] },
		L3: { paytable: [{ '3': 4 }] },
		L4: { paytable: [{ '3': 1 }] },
	},
	paddingReels: {
		basegame: [paddingReel, paddingReel, paddingReel],
		bonusgame: [paddingReel, paddingReel, paddingReel],
	},
};
