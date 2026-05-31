import {
	API_AMOUNT_MULTIPLIER,
	BOOK_AMOUNT_MULTIPLIER,
	DEFAULT_CURRENCY,
	STARTING_BALANCE,
} from './config';
import { getBooks, type RawBook, type RawBookEvent } from './books';

type Balance = {
	amount: number;
	currency: string;
};

type ActiveRound = {
	roundID: number;
	amount: number;
	payout: number;
	payoutMultiplier: number;
	active: boolean;
	mode: string;
	event: string | null;
	state: object[];
};

type Session = {
	sessionID: string;
	balance: Balance;
	activeRound: ActiveRound | null;
	activeBonusSequence: {
		events: RawBookEvent[];
		nextEventIndex: number;
	} | null;
	nextRoundID: number;
	nextBookIndexByMode: Record<string, number>;
};

export const statusSuccess = {
	statusCode: 'SUCCESS',
	statusMessage: 'Operation Completed Successfully',
} as const;

const sessions = new Map<string, Session>();
const MANUAL_BONUS_SESSION_ID = 'slot-3x3-local';
const VALUE_COIN_SYMBOL_NAME = 'VALUE_COIN';
const BONUS_TOTAL_EVENT_TYPES = new Set(['bonusEnd', 'setTotalWin', 'finalWin']);
const ROUND_PAYOUT_EVENT_TYPES = ['finalWin', 'freeSpinEnd', 'bonusEnd', 'setTotalWin'] as const;

function clone<T>(value: T): T {
	return structuredClone(value);
}

function createSession(sessionID: string, currency = DEFAULT_CURRENCY): Session {
	return {
		sessionID,
		balance: {
			amount: STARTING_BALANCE,
			currency,
		},
		activeRound: null,
		activeBonusSequence: null,
		nextRoundID: 1,
		nextBookIndexByMode: {},
	};
}

export function getSession(sessionID: string, currency = DEFAULT_CURRENCY) {
	const existingSession = sessions.get(sessionID);
	if (existingSession) return existingSession;

	const session = createSession(sessionID, currency);
	sessions.set(sessionID, session);
	return session;
}

function nextBook(session: Session, mode: string): RawBook {
	const books = getBooks(mode, { sessionID: session.sessionID });
	if (books.length === 0) {
		throw new Error(`No mock books configured for mode ${mode}. Add books to apps/mock-rgs/src/books.`);
	}

	const modeKey = mode.toUpperCase();
	const nextBookIndex = session.nextBookIndexByMode[modeKey] ?? 0;
	const book = books[nextBookIndex % books.length];
	session.nextBookIndexByMode[modeKey] = nextBookIndex + 1;

	return book;
}

const isManualBonusSession = (session: Session) => session.sessionID === MANUAL_BONUS_SESSION_ID;
const isBonusMode = (mode: string) => mode.toUpperCase() === 'BONUS';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const roundMoney = (value: number) => Math.round(value * 100) / 100;
const apiAmountToMoney = (value: number) => roundMoney(value / API_AMOUNT_MULTIPLIER);
const moneyToApiAmount = (value: number) => Math.round(value * API_AMOUNT_MULTIPLIER);
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

function calculateBookPayoutMultiplier(book: RawBook) {
	const roundBookEventAmount = findRoundBookEventAmount(book.events ?? []);
	if (roundBookEventAmount !== null) {
		return bookEventAmountToPayoutMultiplier(roundBookEventAmount);
	}

	return book.payoutMultiplier ?? 0;
}

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

function hydrateManualBonusEvent(event: RawBookEvent, betAmount: number): RawBookEvent {
	const hydratedEvent = { ...event };

	if ('board' in hydratedEvent) {
		hydratedEvent.board = hydrateBoardCoinAmounts(hydratedEvent.board, betAmount);
	}

	if (hydratedEvent.type === 'bonusReveal') {
		hydratedEvent.totalWin = sumBoardCoinAmounts(hydratedEvent.board);
	}

	return hydratedEvent;
}

function findFinalBonusAmount(events: RawBookEvent[]) {
	const lastBonusReveal = [...events]
		.reverse()
		.find((event) => event.type === 'bonusReveal' && typeof event.totalWin === 'number');

	return typeof lastBonusReveal?.totalWin === 'number' ? lastBonusReveal.totalWin : 0;
}

function hydrateManualBonusBook(book: RawBook, apiBetAmount: number) {
	const betAmount = apiAmountToMoney(apiBetAmount);
	const hydratedEvents = (book.events ?? []).map((event) =>
		hydrateManualBonusEvent(event, betAmount),
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

function splitManualBonusEvents(events: RawBookEvent[]) {
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

function nextManualBonusSlice(session: Session) {
	if (!session.activeRound || !session.activeBonusSequence) {
		throw new Error('No active bonus round for this session.');
	}

	const { events, nextEventIndex } = session.activeBonusSequence;
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

	session.activeBonusSequence.nextEventIndex = nextIndex;
	session.activeRound.state = [...session.activeRound.state, ...clone(nextEvents)];

	if (nextEvents.some((bonusEvent) => bonusEvent.type === 'bonusEnd')) {
		session.activeBonusSequence = null;
	}

	return {
		...session.activeRound,
		state: clone(nextEvents),
	};
}

export function authenticateSession(options: { sessionID: string; language?: string }) {
	const session = getSession(options.sessionID);

	return {
		status: statusSuccess,
		balance: clone(session.balance),
		round: session.activeRound ? clone(session.activeRound) : undefined,
		config: {
			betLevels: [100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000],
			betModes: {
				BASE: {
					mode: 'BASE',
					costMultiplier: 1,
					feature: false,
				},
				BONUS: {
					mode: 'BONUS',
					costMultiplier: 100,
					feature: true,
				},
			},
			defaultBetLevel: 1000000,
			jurisdiction: {
				socialCasino: false,
				disabledFullscreen: false,
				disabledTurbo: false,
				disabledSuperTurbo: false,
				disabledAutoplay: false,
				disabledSlamstop: false,
				disabledSpacebar: false,
				disabledBuyFeature: false,
				displayNetPosition: false,
				displayRTP: false,
				displaySessionTimer: false,
				minimumRoundDuration: 0,
			},
		},
	};
}

export function play(options: {
	sessionID: string;
	amount: number;
	currency: string;
	mode: string;
}) {
	const session = getSession(options.sessionID, options.currency);
	if (isManualBonusSession(session) && isBonusMode(options.mode)) {
		return {
			status: statusSuccess,
			balance: clone(session.balance),
			round: clone(nextManualBonusSlice(session)),
		};
	}

	if (isManualBonusSession(session) && session.activeRound) {
		throw new Error('Cannot start a new base spin while a round is active.');
	}

	const rawBook = nextBook(session, options.mode);
	const hasManualBonus = isManualBonusSession(session)
		? splitManualBonusEvents(rawBook.events ?? []) !== null
		: false;
	const manualBonusBook = hasManualBonus
		? hydrateManualBonusBook(rawBook, options.amount)
		: null;
	const book = manualBonusBook?.book ?? rawBook;
	const payoutMultiplier = manualBonusBook?.payoutMultiplier ?? calculateBookPayoutMultiplier(book);
	const payout = manualBonusBook
		? moneyToApiAmount(manualBonusBook.finalBonusAmount)
		: Math.round(options.amount * payoutMultiplier);
	const manualBonus = isManualBonusSession(session)
		? splitManualBonusEvents(book.events ?? [])
		: null;
	const state = manualBonus?.baseEvents ?? book.events ?? [];
	const active = payout > 0 || manualBonus !== null;

	session.balance.currency = options.currency;
	session.balance.amount -= options.amount;

	const round: ActiveRound = {
		roundID: session.nextRoundID,
		amount: options.amount,
		payout,
		payoutMultiplier,
		active,
		mode: options.mode,
		event: null,
		state: clone(state),
	};

	session.nextRoundID += 1;
	session.activeRound = active ? round : null;
	session.activeBonusSequence = manualBonus
		? {
				events: clone(manualBonus.bonusEvents),
				nextEventIndex: 0,
			}
		: null;

	return {
		status: statusSuccess,
		balance: clone(session.balance),
		round: clone(round),
	};
}

export function endRound(options: { sessionID: string }) {
	const session = getSession(options.sessionID);

	if (session.activeRound) {
		session.balance.amount += session.activeRound.payout;
		session.activeRound = null;
		session.activeBonusSequence = null;
	}

	return {
		status: statusSuccess,
		balance: clone(session.balance),
	};
}

export function recordEvent(options: { sessionID: string; event?: string }) {
	const session = getSession(options.sessionID);
	if (session.activeRound) {
		session.activeRound.event = options.event ?? null;
	}

	return {
		status: statusSuccess,
		event: options.event,
	};
}
