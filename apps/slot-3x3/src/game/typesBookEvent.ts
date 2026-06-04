import type { BetType } from 'rgs-requests';

import type { GameType, LineWin, Position, RawSymbol } from './types';

type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	gameType: GameType;
	paddingPositions: number[];
};

type BookEventBonusTrigger = {
	index: number;
	type: 'bonusTrigger';
	positions: Position[];
	respins: number;
};

type BookEventBonusReveal = {
	index: number;
	type: 'bonusReveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	respins: number;
	coinsAdded: Position[];
	totalWin: number;
};

type BookEventBonusEnd = {
	index: number;
	type: 'bonusEnd';
	amount: number;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: LineWin[];
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

export type BookEvent =
	| BookEventReveal
	| BookEventBonusTrigger
	| BookEventBonusReveal
	| BookEventBonusEnd
	| BookEventWinInfo
	| BookEventSetTotalWin
	| BookEventFinalWin;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
