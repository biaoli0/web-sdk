import { API_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { requestBet } from 'rgs-requests';
import { stateBet, stateModal, stateUrlDerived } from 'state-shared';

import { playBookEvents } from '../bookPlayback';
import { bonusGameDerived, stateGame } from '../state/stateGame.svelte';
import type { RawSymbol } from '../types';
import type { Bet, BookEvent, BookEventOfType } from '../typesBookEvent';
import {
	BONUS_PLAY_MODE,
	createBonusFlowActor,
	createBonusIntermediateMachines,
	createBonusPrimaryMachines,
} from './createBonusFlowActor';

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

const resetManualBonusRound = () => {
	completeManualBonusRound = null;
	manualBonusRoundPromise = null;
};

const requestBonusSpin = async () => {
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
};

const bonusPrimaryMachines = createBonusPrimaryMachines({ requestBonusSpin });
const bonusIntermediateMachines = createBonusIntermediateMachines(bonusPrimaryMachines);

export const bonusFlowActor = createBonusFlowActor(bonusIntermediateMachines, {
	canBonusSpin: () => bonusGameDerived.canBonusSpin(),
	markBonusSpinning: () => {
		stateGame.bonus.isSpinning = true;
	},
	clearBonusSpinning: () => {
		stateGame.bonus.isSpinning = false;
	},
	finishManualBonusRound,
	resetManualBonusRound,
	openBonusError: (error) => {
		stateModal.modal = { name: 'error', error };
		console.error(error);
	},
});

export const waitForManualBonusRound = (bookEvents: BookEvent[]) =>
	isManualBonusRoundStart(bookEvents) ? startManualBonusRound() : Promise.resolve();

export const resetBonusFlow = () => {
	bonusFlowActor.send({ type: 'RESET' });
};

export const sendBonusSpin = () => {
	bonusFlowActor.send({ type: 'BONUS_SPIN' });
};
