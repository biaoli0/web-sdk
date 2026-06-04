import { createBonusIntermediateMachineBonusSpin } from './createBonusIntermediateMachineBonusSpin';
import type { BonusPrimaryMachines } from './createBonusPrimaryMachines';

export const createBonusIntermediateMachines = ({ requestBonusSpin }: BonusPrimaryMachines) => {
	const bonusSpin = createBonusIntermediateMachineBonusSpin({ requestBonusSpin });

	return {
		bonusSpin,
	};
};

export type BonusIntermediateMachines = ReturnType<typeof createBonusIntermediateMachines>;
