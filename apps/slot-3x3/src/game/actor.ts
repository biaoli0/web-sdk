import { createPrimaryMachines, createIntermediateMachines, createGameActor } from 'utils-xstate';
import { stateBet } from 'state-shared';

import type { Bet } from './typesBookEvent';
import { stateXstateDerived } from './stateXstate';
import { playBet, playBonusSpin } from './utils';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import config from './config';
import type { RawSymbol } from './types';

const findLastRevealBoard = (bet: Bet) => {
	const lastReveal = [...bet.state]
		.reverse()
		.find((bookEvent) => bookEvent.type === 'reveal' || bookEvent.type === 'bonusReveal');

	return lastReveal && 'board' in lastReveal ? (lastReveal.board as RawSymbol[][]) : undefined;
};

const checkIsBonusGame = (bet: Bet) =>
	bet.state.some(
		(bookEvent) => bookEvent.type === 'bonusTrigger' || bookEvent.type === 'bonusReveal',
	);

const primaryMachines = createPrimaryMachines<Bet>({
	onResumeGameActive: (betToResume) => betToResume,
	onResumeGameInactive: (betToResume) => {
		const lastRevealBoard = findLastRevealBoard(betToResume);

		if (lastRevealBoard) stateGameDerived.enhancedBoard.settle(lastRevealBoard);
	},
	onNewGameStart: async () => {
		stateGameDerived.resetWinInfo();
		stateGame.bonus.status = 'inactive';
		stateGame.bonus.introVisible = false;
		stateGame.bonus.isSpinning = false;
		stateGame.bonus.respins = 0;
		stateGame.bonus.totalWin = 0;
		stateGame.bonus.coinsAdded = [];

		const isTurbo = stateGameDerived.isTurbo();

		if ((isTurbo && stateXstateDerived.isAutoBetting()) || stateBet.isSpaceHold) return;

		await stateGameDerived.enhancedBoard.preSpin({
			paddingBoard: config.paddingReels[stateGame.gameType],
		});
	},
	onNewGameError: () => stateGameDerived.enhancedBoard.settle(),
	onPlayGame: async (bet) => await playBet(bet),
	checkIsBonusGame,
});

const intermediateMachines = createIntermediateMachines(primaryMachines);

export const gameActor = createGameActor(intermediateMachines);

export const ACTOR_EVENT_BONUS_SPIN = 'BONUS_SPIN' as const;

type BonusSpinActorEvent = { type: typeof ACTOR_EVENT_BONUS_SPIN };
type GameActorEvent = Parameters<typeof gameActor.send>[0] | BonusSpinActorEvent;

export const sendGameActorEvent = (event: GameActorEvent) => {
	if (event.type === ACTOR_EVENT_BONUS_SPIN) {
		void playBonusSpin();
		return;
	}

	gameActor.send(event);
};
