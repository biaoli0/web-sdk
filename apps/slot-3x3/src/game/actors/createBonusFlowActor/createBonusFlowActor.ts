import { setup, createActor, type DoneActorEvent } from 'xstate';

import type { BookEvent } from '../../typesBookEvent';
import type { BonusIntermediateMachines } from './createBonusIntermediateMachines';
import type { BonusSpinOutput } from './createBonusPrimaryMachines';

type BonusFlowEvent =
	| { type: 'MANUAL_ROUND_STARTED' }
	| { type: 'BONUS_SPIN' }
	| { type: 'RESET' }
	| DoneActorEvent<BonusSpinOutput, 'bonusSpin'>;

type CreateBonusFlowActorOptions = {
	canBonusSpin: () => boolean;
	markBonusSpinning: () => void;
	clearBonusSpinning: () => void;
	finishManualBonusRound: () => void;
	resetManualBonusRound: () => void;
	openBonusError: (error: unknown) => void;
};

const hasBookEvent = (bookEvents: BookEvent[], type: BookEvent['type']) =>
	bookEvents.some((bookEvent) => bookEvent.type === type);

const manualBonusRoundHasEnded = (bookEvents: BookEvent[]) => hasBookEvent(bookEvents, 'bonusEnd');

export const createBonusFlowActor = (
	{ bonusSpin }: BonusIntermediateMachines,
	{
		canBonusSpin,
		markBonusSpinning,
		clearBonusSpinning,
		finishManualBonusRound,
		resetManualBonusRound,
		openBonusError,
	}: CreateBonusFlowActorOptions,
) => {
	const bonusFlowMachine = setup({
		types: {} as {
			events: BonusFlowEvent;
		},
		actors: {
			bonusSpin,
		},
		guards: {
			canBonusSpin,
			isManualBonusRoundComplete: ({ event }) => {
				if (!('output' in event)) return false;

				return manualBonusRoundHasEnded(event.output.bookEvents);
			},
		},
		actions: {
			markBonusSpinning,
			clearBonusSpinning,
			finishManualBonusRound,
			resetManualBonusRound,
			openBonusError: ({ event }) => {
				const error = 'error' in event ? event.error : event;
				openBonusError(error);
			},
		},
	}).createMachine({
		id: 'slot3x3BonusFlow',
		initial: 'idle',
		on: {
			RESET: {
				target: '.idle',
				actions: 'resetManualBonusRound',
			},
		},
		states: {
			idle: {
				on: {
					MANUAL_ROUND_STARTED: 'ready',
				},
			},
			ready: {
				on: {
					MANUAL_ROUND_STARTED: 'ready',
					BONUS_SPIN: {
						guard: 'canBonusSpin',
						target: 'spinning',
						actions: 'markBonusSpinning',
					},
				},
			},
			spinning: {
				invoke: {
					id: 'bonusSpin',
					src: 'bonusSpin',
					onDone: [
						{
							guard: 'isManualBonusRoundComplete',
							target: 'idle',
							actions: ['clearBonusSpinning', 'finishManualBonusRound'],
						},
						{
							target: 'ready',
							actions: 'clearBonusSpinning',
						},
					],
					onError: {
						target: 'ready',
						actions: ['clearBonusSpinning', 'openBonusError'],
					},
				},
			},
		},
	});

	return createActor(bonusFlowMachine);
};
