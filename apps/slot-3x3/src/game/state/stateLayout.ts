import { createLayout } from 'utils-layout';

import { MAIN_SIZES } from '../constants';

export const { stateLayout, stateLayoutDerived } = createLayout({
	backgroundRatio: {
		normal: 2039 / 1000,
		portrait: 1242 / 2208,
	},
	mainSizesMap: MAIN_SIZES,
});
