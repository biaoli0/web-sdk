import { createPlayBookUtils } from 'utils-book';
import { API_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateBet, stateModal, stateUrlDerived } from 'state-shared';
import { requestBet } from 'rgs-requests';

import { bookEventHandlerMap } from './bookEventHandlerMap';
import { stateGame, stateGameDerived } from './state/stateGame.svelte';
import type { Bet, BookEvent } from './typesBookEvent';

export const { playBookEvent, playBookEvents } = createPlayBookUtils({ bookEventHandlerMap });

let completeManualBonusRound: (() => void) | null = null;
let manualBonusRoundPromise: Promise<void> | null = null;

const hasBookEvent = (bookEvents: BookEvent[], type: BookEvent['type']) =>
	bookEvents.some((bookEvent) => bookEvent.type === type);

const isManualBonusRoundStart = (bookEvents: BookEvent[]) =>
	hasBookEvent(bookEvents, 'bonusTrigger') && !hasBookEvent(bookEvents, 'bonusEnd');

const waitForManualBonusRound = () => {
	manualBonusRoundPromise = new Promise((resolve) => {
		completeManualBonusRound = resolve;
	});

	return manualBonusRoundPromise;
};

const finishManualBonusRound = () => {
	completeManualBonusRound?.();
	completeManualBonusRound = null;
	manualBonusRoundPromise = null;
};

export const playBet = async (bet: Bet) => {
	stateBet.winBookEventAmount = 0;
	await playBookEvents(bet.state);

	if (isManualBonusRoundStart(bet.state)) {
		await waitForManualBonusRound();
	}
};

export const playBonusSpin = async () => {
	if (
		stateGame.bonus.status !== 'active' ||
		stateGame.bonus.introVisible ||
		stateGame.bonus.isSpinning ||
		stateGame.bonus.respins <= 0 ||
		stateGameDerived.isSpinning()
	) {
		return;
	}

	stateGame.bonus.isSpinning = true;

	try {
		const data = await requestBet({
			rgsUrl: stateUrlDerived.rgsUrl(),
			sessionID: stateUrlDerived.sessionID(),
			currency: stateBet.currency,
			mode: 'BONUS',
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

		if (hasBookEvent(bookEvents, 'bonusEnd')) {
			finishManualBonusRound();
		}
	} catch (error) {
		stateModal.modal = { name: 'error', error };
		console.error(error);
	} finally {
		stateGame.bonus.isSpinning = false;
	}
};
