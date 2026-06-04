import { apiAmountToMoney, moneyToApiAmount, roundMoney } from '../payout';
import type { BookAdapter, BonusSequence } from '../adapters';
import type { RawBook, RawBookEvent } from '../index';

export const SLOT_3X3_SESSION_ID = 'slot-3x3-local';

const SIDE_REEL_INDEXES = [0, 2];
const VALUE_COIN_SYMBOL_NAME = 'VALUE_COIN';
const BONUS_TOTAL_EVENT_TYPES = new Set(['bonusEnd', 'setTotalWin', 'finalWin']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isSlot3x3Session = (sessionID: string) => sessionID === SLOT_3X3_SESSION_ID;
const isBonusMode = (mode: string) => mode.toUpperCase() === 'BONUS';

function hydrateCoinSymbol(symbol: unknown, betAmount: number) {
	if (!isRecord(symbol) || symbol.name !== VALUE_COIN_SYMBOL_NAME) return symbol;

	const multiplier = typeof symbol.multiplier === 'number' ? symbol.multiplier : 0;
	const { value: _value, ...symbolWithoutValue } = symbol;

	return {
		...symbolWithoutValue,
		amount: roundMoney(betAmount * multiplier),
	};
}

function hydrateBoardCoinAmounts(board: unknown, betAmount: number) {
	if (!Array.isArray(board)) return board;

	return board.map((reel) =>
		Array.isArray(reel) ? reel.map((symbol) => hydrateCoinSymbol(symbol, betAmount)) : reel,
	);
}

function sumBoardCoinAmounts(board: unknown) {
	if (!Array.isArray(board)) return 0;

	return roundMoney(
		board.reduce(
			(total, reel) =>
				total +
				(Array.isArray(reel)
					? reel.reduce(
							(reelTotal, symbol) =>
								reelTotal +
								(isRecord(symbol) &&
								symbol.name === VALUE_COIN_SYMBOL_NAME &&
								typeof symbol.amount === 'number'
									? symbol.amount
									: 0),
							0,
						)
					: 0),
			0,
		),
	);
}

function hasSideReelValueCoin(board: unknown) {
	if (!Array.isArray(board)) return false;

	return SIDE_REEL_INDEXES.some((reelIndex) => {
		const reel = board[reelIndex];

		return (
			Array.isArray(reel) &&
			reel.some((symbol) => isRecord(symbol) && symbol.name === VALUE_COIN_SYMBOL_NAME)
		);
	});
}

type HydrationState = {
	currentBoard: unknown;
	totalWin: number;
};

function hydrateBonusEvent(
	event: RawBookEvent,
	betAmount: number,
	bonusState: HydrationState,
): RawBookEvent {
	const hydratedEvent = { ...event };

	if ('board' in hydratedEvent) {
		hydratedEvent.board = hydrateBoardCoinAmounts(hydratedEvent.board, betAmount);
		bonusState.currentBoard = hydratedEvent.board;
	}

	if (hydratedEvent.type === 'bonusTrigger') {
		bonusState.totalWin = sumBoardCoinAmounts(bonusState.currentBoard);
	}

	if (hydratedEvent.type === 'bonusReveal') {
		if (hasSideReelValueCoin(hydratedEvent.board)) {
			bonusState.totalWin = roundMoney(
				bonusState.totalWin + sumBoardCoinAmounts(hydratedEvent.board),
			);
		}

		hydratedEvent.totalWin = bonusState.totalWin;
	}

	return hydratedEvent;
}

function findFinalBonusAmount(events: RawBookEvent[]) {
	const lastBonusReveal = [...events]
		.reverse()
		.find((event) => event.type === 'bonusReveal' && typeof event.totalWin === 'number');

	return typeof lastBonusReveal?.totalWin === 'number' ? lastBonusReveal.totalWin : 0;
}

function hydrateBonusBook(book: RawBook, apiBetAmount: number) {
	const betAmount = apiAmountToMoney(apiBetAmount);
	const bonusState: HydrationState = {
		currentBoard: null,
		totalWin: 0,
	};
	const hydratedEvents = (book.events ?? []).map((event) =>
		hydrateBonusEvent(event, betAmount, bonusState),
	);
	const finalBonusAmount = findFinalBonusAmount(hydratedEvents);
	const payoutMultiplier = betAmount > 0 ? roundMoney(finalBonusAmount / betAmount) : 0;
	const events = hydratedEvents.map((event) =>
		BONUS_TOTAL_EVENT_TYPES.has(event.type) ? { ...event, amount: finalBonusAmount } : event,
	);

	return {
		payoutMultiplier,
		book: {
			...book,
			payoutMultiplier,
			events,
		},
		finalBonusAmount,
	};
}

function splitBonusEvents(events: RawBookEvent[]) {
	const bonusTriggerIndex = events.findIndex((event) => event.type === 'bonusTrigger');
	if (bonusTriggerIndex === -1) return null;

	const bonusEndIndex = events.findIndex(
		(event, index) => index > bonusTriggerIndex && event.type === 'bonusEnd',
	);

	if (bonusEndIndex === -1) return null;

	return {
		baseEvents: events.slice(0, bonusTriggerIndex + 1),
		bonusEvents: events.slice(bonusTriggerIndex + 1, bonusEndIndex + 1),
	};
}

function preparePlay(book: RawBook, options: { apiBetAmount: number }) {
	const initialBonusEvents = splitBonusEvents(book.events ?? []);
	if (!initialBonusEvents) return null;

	const hydratedBonusBook = hydrateBonusBook(book, options.apiBetAmount);
	const bonusEvents = splitBonusEvents(hydratedBonusBook.book.events ?? []);
	if (!bonusEvents) return null;

	return {
		book: hydratedBonusBook.book,
		payout: moneyToApiAmount(hydratedBonusBook.finalBonusAmount),
		payoutMultiplier: hydratedBonusBook.payoutMultiplier,
		state: bonusEvents.baseEvents,
		bonusSequence: {
			events: bonusEvents.bonusEvents,
			nextEventIndex: 0,
		},
	};
}

function nextBonusSlice(bonusSequence: BonusSequence) {
	const { events, nextEventIndex } = bonusSequence;
	const event = events[nextEventIndex];
	if (!event) {
		throw new Error('No bonus spins remaining for this session.');
	}

	const nextEvents = [event];
	let nextIndex = nextEventIndex + 1;
	const nextEvent = events[nextIndex];

	if (event.type === 'bonusReveal' && nextEvent?.type === 'bonusEnd') {
		nextEvents.push(nextEvent);
		nextIndex += 1;
	}

	return {
		events: nextEvents,
		nextEventIndex: nextIndex,
		complete: nextEvents.some((bonusEvent) => bonusEvent.type === 'bonusEnd'),
	};
}

export const slot3x3BookAdapter: BookAdapter = {
	canHandleSession: isSlot3x3Session,
	isBonusPlayMode: isBonusMode,
	preparePlay,
	nextBonusSlice,
};
