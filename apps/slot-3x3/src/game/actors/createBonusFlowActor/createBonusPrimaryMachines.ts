import { fromPromise } from 'xstate';

import type { BookEvent } from '../../typesBookEvent';

export const BONUS_PLAY_MODE = 'BONUS' as const;

export type BonusSpinOutput = {
	bookEvents: BookEvent[];
};

type CreateBonusPrimaryMachinesOptions = {
	requestBonusSpin: () => Promise<BonusSpinOutput>;
};

export const createBonusPrimaryMachines = ({
	requestBonusSpin,
}: CreateBonusPrimaryMachinesOptions) => {
	const requestBonusSpinMachine = fromPromise(requestBonusSpin);

	return {
		requestBonusSpin: requestBonusSpinMachine,
	};
};

export type BonusPrimaryMachines = ReturnType<typeof createBonusPrimaryMachines>;
