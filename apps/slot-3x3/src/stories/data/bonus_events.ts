import type { BookEventOfType } from '../../game/typesBookEvent';

const reveal: BookEventOfType<'reveal'> = {
	index: 0,
	type: 'reveal',
	gameType: 'bonusgame',
	paddingPositions: [0, 0, 0],
	board: [
		[{ name: 'H1' }, { name: 'L1' }, { name: 'H3' }],
		[
			{ name: 'COIN', value: 100 },
			{ name: 'COIN', value: 200 },
			{ name: 'COIN', value: 300 },
		],
		[{ name: 'H2' }, { name: 'L3' }, { name: 'L4' }],
	],
};

export default {
	reveal,
};
