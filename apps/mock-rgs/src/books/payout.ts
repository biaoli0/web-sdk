import { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from '../config';
import type { RawBook, RawBookEvent } from './index';

const ROUND_PAYOUT_EVENT_TYPES = ['finalWin', 'freeSpinEnd', 'bonusEnd', 'setTotalWin'] as const;

export const roundMoney = (value: number) => Math.round(value * 100) / 100;
export const apiAmountToMoney = (value: number) => roundMoney(value / API_AMOUNT_MULTIPLIER);
export const moneyToApiAmount = (value: number) => Math.round(value * API_AMOUNT_MULTIPLIER);

const bookEventAmountToPayoutMultiplier = (value: number) => value / BOOK_AMOUNT_MULTIPLIER;

function findLatestAmountEvent(events: RawBookEvent[], type: string) {
	const event = [...events]
		.reverse()
		.find((bookEvent) => bookEvent.type === type && typeof bookEvent.amount === 'number');

	return typeof event?.amount === 'number' ? event.amount : null;
}

function findRoundBookEventAmount(events: RawBookEvent[]) {
	for (const type of ROUND_PAYOUT_EVENT_TYPES) {
		const amount = findLatestAmountEvent(events, type);
		if (amount !== null) return amount;
	}

	const winInfoEvent = [...events]
		.reverse()
		.find((event) => event.type === 'winInfo' && typeof event.totalWin === 'number');

	return typeof winInfoEvent?.totalWin === 'number' ? winInfoEvent.totalWin : null;
}

export function calculateBookPayoutMultiplier(book: RawBook) {
	const roundBookEventAmount = findRoundBookEventAmount(book.events ?? []);
	if (roundBookEventAmount !== null) {
		return bookEventAmountToPayoutMultiplier(roundBookEventAmount);
	}

	return book.payoutMultiplier ?? 0;
}
