import { setup, assign } from 'xstate';

import type { BonusPrimaryMachines, BonusSpinOutput } from './createBonusPrimaryMachines';

type BonusSpinContext = BonusSpinOutput;

const context: BonusSpinContext = {
	bookEvents: [],
};

export const createBonusIntermediateMachineBonusSpin = ({
	requestBonusSpin,
}: {
	requestBonusSpin: BonusPrimaryMachines['requestBonusSpin'];
}) => {
	const machine = setup({
		types: {} as {
			context: BonusSpinContext;
			output: BonusSpinOutput;
		},
		actors: {
			requestBonusSpin,
		},
	}).createMachine({
		context,
		id: 'bonusSpin',
		initial: 'requesting',
		output: ({ context }) => ({
			bookEvents: context.bookEvents,
		}),
		states: {
			requesting: {
				invoke: {
					id: 'requestBonusSpin',
					src: 'requestBonusSpin',
					onDone: [
						{
							actions: assign(({ event }) => event.output),
							target: 'end',
						},
					],
				},
			},
			end: {
				type: 'final',
			},
		},
	});

	return machine;
};
