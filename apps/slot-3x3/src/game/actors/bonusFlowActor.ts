import { setup, fromPromise, createActor } from 'xstate';

import { API_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateBet, stateModal, stateUrlDerived } from 'state-shared';
import { requestBet } from 'rgs-requests';

import { playBookEvents } from '../bookPlayback';
import { CENTRAL_REEL_INDEX } from '../constants';
import { bonusGameDerived, stateGame } from '../state/stateGame.svelte';
import type { RawSymbol } from '../types';
import type { Bet, BookEvent, BookEventOfType } from '../typesBookEvent';

export const BONUS_PLAY_MODE = 'BONUS' as const;

type BonusFlowEvent = { type: 'MANUAL_ROUND_STARTED' } | { type: 'BONUS_SPIN' } | { type: 'RESET' };

type RevealBoardEvent = BookEventOfType<'reveal'> | BookEventOfType<'bonusReveal'>;
type BonusEntryEvent = BookEventOfType<'bonusTrigger'> | BookEventOfType<'bonusReveal'>;

let completeManualBonusRound: (() => void) | null = null;
let manualBonusRoundPromise: Promise<void> | null = null;

const isRevealBoardEvent = (bookEvent: BookEvent): bookEvent is RevealBoardEvent =>
	bookEvent.type === 'reveal' || bookEvent.type === 'bonusReveal';

const isBonusEntryEvent = (bookEvent: BookEvent): bookEvent is BonusEntryEvent =>
	bookEvent.type === 'bonusTrigger' || bookEvent.type === 'bonusReveal';

const hasBookEvent = (bookEvents: BookEvent[], type: BookEvent['type']) =>
	bookEvents.some((bookEvent) => bookEvent.type === type);

export const findLastRevealBoard = (bet: Bet): RawSymbol[][] | undefined =>
	[...bet.state].reverse().find(isRevealBoardEvent)?.board;

export const isBonusBet = (bet: Bet) => bet.state.some(isBonusEntryEvent);

export const isManualBonusRoundStart = (bookEvents: BookEvent[]) =>
	hasBookEvent(bookEvents, 'bonusTrigger') && !hasBookEvent(bookEvents, 'bonusEnd');

export const isManualBonusRoundComplete = (bookEvents: BookEvent[]) =>
	hasBookEvent(bookEvents, 'bonusEnd');

export const shouldHoldBonusRevealReel = (reelIndex: number) => reelIndex === CENTRAL_REEL_INDEX;

const startManualBonusRound = () => {
	manualBonusRoundPromise ??= new Promise((resolve) => {
		completeManualBonusRound = resolve;
	});

	bonusFlowActor.send({ type: 'MANUAL_ROUND_STARTED' });

	return manualBonusRoundPromise;
};

const finishManualBonusRound = () => {
	completeManualBonusRound?.();
	completeManualBonusRound = null;
	manualBonusRoundPromise = null;
};

const requestBonusSpin = fromPromise(async () => {
	const data = await requestBet({
		rgsUrl: stateUrlDerived.rgsUrl(),
		sessionID: stateUrlDerived.sessionID(),
		currency: stateBet.currency,
		mode: BONUS_PLAY_MODE,
		amount: 0,
	});

	if (data?.error) {
		throw data;
	}

	if (data?.balance?.amount !== undefined) {
		stateBet.balanceAmount = data.balance.amount / API_AMOUNT_MULTIPLIER;
	}

	const bookEvents = (data?.round?.state ?? []) as BookEvent[];
	if (bookEvents.length === 0) {
		throw new Error('Empty bonus state in data.round');
	}

	await playBookEvents(bookEvents);

	return { bookEvents };
});

const bonusFlowMachine = setup({
	types: {} as {
		events: BonusFlowEvent;
	},
	actors: {
		requestBonusSpin,
	},
	guards: {
		canBonusSpin: () => bonusGameDerived.canBonusSpin(),
	},
	actions: {
		markBonusSpinning: () => {
			stateGame.bonus.isSpinning = true;
		},
		clearBonusSpinning: () => {
			stateGame.bonus.isSpinning = false;
		},
		finishManualBonusRound,
		resetManualBonusRound: () => {
			completeManualBonusRound = null;
			manualBonusRoundPromise = null;
		},
		openBonusError: ({ event }) => {
			const error = 'error' in event ? event.error : event;
			stateModal.modal = { name: 'error', error };
			console.error(error);
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
				id: 'requestBonusSpin',
				src: 'requestBonusSpin',
				onDone: [
					{
						guard: ({ event }) => isManualBonusRoundComplete(event.output.bookEvents),
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

export const bonusFlowActor = createActor(bonusFlowMachine);

export const waitForManualBonusRound = (bookEvents: BookEvent[]) =>
	isManualBonusRoundStart(bookEvents) ? startManualBonusRound() : Promise.resolve();

export const resetBonusFlow = () => {
	bonusFlowActor.send({ type: 'RESET' });
};

export const sendBonusSpin = () => {
	bonusFlowActor.send({ type: 'BONUS_SPIN' });
};
