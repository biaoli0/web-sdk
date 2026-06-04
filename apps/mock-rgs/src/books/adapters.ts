import type { RawBook, RawBookEvent } from './index';
import { slot3x3BookAdapter } from './slot-3x3/adapter';

export type BonusSequence = {
	events: RawBookEvent[];
	nextEventIndex: number;
};

export type PreparedBookPlay = {
	book: RawBook;
	payout: number;
	payoutMultiplier: number;
	state: RawBookEvent[];
	bonusSequence: BonusSequence | null;
};

export type BonusSlice = {
	events: RawBookEvent[];
	nextEventIndex: number;
	complete: boolean;
};

export type BookAdapter = {
	canHandleSession: (sessionID: string) => boolean;
	isBonusPlayMode: (mode: string) => boolean;
	preparePlay: (book: RawBook, options: { apiBetAmount: number }) => PreparedBookPlay | null;
	nextBonusSlice: (bonusSequence: BonusSequence) => BonusSlice;
};

const bookAdapters: BookAdapter[] = [slot3x3BookAdapter];

export function getBookAdapter(sessionID: string) {
	return bookAdapters.find((adapter) => adapter.canHandleSession(sessionID)) ?? null;
}
