import { DEFAULT_CURRENCY, STARTING_BALANCE } from './config';
import { getBooks, type RawBook } from './books';
import { getBookAdapter, type BookAdapter, type BonusSequence } from './books/adapters';
import { calculateBookPayoutMultiplier } from './books/payout';

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
	activeBonusSequence: BonusSequence | null;
	nextRoundID: number;
	nextBookIndexByMode: Record<string, number>;
};

export const statusSuccess = {
	statusCode: 'SUCCESS',
	statusMessage: 'Operation Completed Successfully',
} as const;

const sessions = new Map<string, Session>();

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
		throw new Error(
			`No mock books configured for mode ${mode}. Add books to apps/mock-rgs/src/books.`,
		);
	}

	const modeKey = mode.toUpperCase();
	const nextBookIndex = session.nextBookIndexByMode[modeKey] ?? 0;
	const book = books[nextBookIndex % books.length];
	session.nextBookIndexByMode[modeKey] = nextBookIndex + 1;

	return book;
}

function nextBonusSlice(session: Session, bookAdapter: BookAdapter) {
	if (!session.activeRound || !session.activeBonusSequence) {
		throw new Error('No active bonus round for this session.');
	}

	const bonusSlice = bookAdapter.nextBonusSlice(session.activeBonusSequence);
	session.activeBonusSequence.nextEventIndex = bonusSlice.nextEventIndex;
	session.activeRound.state = [...session.activeRound.state, ...clone(bonusSlice.events)];

	if (bonusSlice.complete) {
		session.activeBonusSequence = null;
	}

	return {
		...session.activeRound,
		state: clone(bonusSlice.events),
	};
}

export function authenticateSession(options: { sessionID: string; language?: string }) {
	const session = getSession(options.sessionID);

	return {
		status: statusSuccess,
		balance: clone(session.balance),
		round: session.activeRound ? clone(session.activeRound) : undefined,
		config: {
			betLevels: [
				1000000, 2000000, 5000000, 10000000, 15000000, 25000000, 40000000, 50000000,
				60000000, 75000000, 100000000, 125000000, 150000000, 200000000, 300000000,
				500000000, 800000000, 900000000, 950000000, 975000000, 1000000000,
			],
			betModes: {
				BASE: {
					mode: 'BASE',
					costMultiplier: 1,
					feature: false,
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
	const bookAdapter = getBookAdapter(session.sessionID);
	if (bookAdapter?.isBonusPlayMode(options.mode)) {
		return {
			status: statusSuccess,
			balance: clone(session.balance),
			round: clone(nextBonusSlice(session, bookAdapter)),
		};
	}

	if (bookAdapter && session.activeRound) {
		throw new Error('Cannot start a new base spin while a round is active.');
	}

	const rawBook = nextBook(session, options.mode);
	const preparedPlay = bookAdapter?.preparePlay(rawBook, { apiBetAmount: options.amount }) ?? null;
	const book = preparedPlay?.book ?? rawBook;
	const payoutMultiplier = preparedPlay?.payoutMultiplier ?? calculateBookPayoutMultiplier(book);
	const payout = preparedPlay?.payout ?? Math.round(options.amount * payoutMultiplier);
	const state = preparedPlay?.state ?? book.events ?? [];
	const bonusSequence = preparedPlay?.bonusSequence ?? null;
	const active = payout > 0 || bonusSequence !== null;

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
	session.activeBonusSequence = bonusSequence ? clone(bonusSequence) : null;

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
