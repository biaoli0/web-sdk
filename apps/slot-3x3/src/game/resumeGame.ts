import type { LineWin, RawSymbol } from './types';
import type { Bet, BookEvent, BookEventOfType } from './typesBookEvent';

export type BaseGameResumeSnapshot = {
	board: RawSymbol[][];
	gameType: BookEventOfType<'reveal'>['gameType'];
	totalWin: number;
	finalWin: number;
	wins: LineWin[];
};

const findLastEvent = <TType extends BookEvent['type']>(
	bookEvents: BookEvent[],
	type: TType,
): Extract<BookEvent, { type: TType }> | undefined =>
	[...bookEvents]
		.reverse()
		.find((bookEvent): bookEvent is Extract<BookEvent, { type: TType }> => bookEvent.type === type);

export const createBaseGameResumeSnapshot = (bet: Bet): BaseGameResumeSnapshot | null => {
	const hasBonusEvent = bet.state.some(
		(bookEvent) =>
			bookEvent.type === 'bonusTrigger' ||
			bookEvent.type === 'bonusReveal' ||
			bookEvent.type === 'bonusEnd',
	);
	if (hasBonusEvent) return null;

	const revealEvent = findLastEvent(bet.state, 'reveal');
	if (!revealEvent) return null;

	const winInfoEvent = findLastEvent(bet.state, 'winInfo');
	const setTotalWinEvent = findLastEvent(bet.state, 'setTotalWin');
	const finalWinEvent = findLastEvent(bet.state, 'finalWin');
	const totalWin = setTotalWinEvent?.amount ?? winInfoEvent?.totalWin ?? 0;

	return {
		board: revealEvent.board,
		gameType: revealEvent.gameType,
		totalWin,
		finalWin: finalWinEvent?.amount ?? totalWin,
		wins: winInfoEvent?.wins ?? [],
	};
};
