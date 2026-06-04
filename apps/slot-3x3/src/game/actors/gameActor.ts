import { createPrimaryMachines, createIntermediateMachines, createGameActor } from 'utils-xstate';
import { stateBet } from 'state-shared';

import type { Bet } from '../typesBookEvent';
import { findLastRevealBoard, isBonusBet, resetBonusFlow, sendBonusSpin } from './bonusFlowActor';
import { stateXstateDerived } from '../state/stateXstate';
import { playBet } from '../utils';
import {
	boardGameDerived,
	reelSpeedGameDerived,
	stateGame,
	winGameDerived,
} from '../state/stateGame.svelte';
import config from '../config';

const primaryMachines = createPrimaryMachines<Bet>({
	onResumeGameActive: (betToResume) => betToResume,
	onResumeGameInactive: (betToResume) => {
		const lastRevealBoard = findLastRevealBoard(betToResume);

		if (lastRevealBoard) boardGameDerived.enhancedBoard.settle(lastRevealBoard);
	},
	onNewGameStart: async () => {
		resetBonusFlow();
		winGameDerived.resetWinInfo();
		stateGame.bonus.status = 'inactive';
		stateGame.bonus.introVisible = false;
		stateGame.bonus.outroVisible = false;
		stateGame.bonus.isSpinning = false;
		stateGame.bonus.respins = 0;
		stateGame.bonus.totalWin = 0;
		stateGame.bonus.coinsAdded = [];

		const isTurbo = reelSpeedGameDerived.isTurbo();

		if ((isTurbo && stateXstateDerived.isAutoBetting()) || stateBet.isSpaceHold) return;

		await boardGameDerived.enhancedBoard.preSpin({
			paddingBoard: config.paddingReels[stateGame.gameType],
		});
	},
	onNewGameError: () => boardGameDerived.enhancedBoard.settle(),
	onPlayGame: async (bet) => await playBet(bet),
	checkIsBonusGame: isBonusBet,
});

const intermediateMachines = createIntermediateMachines(primaryMachines);

export const gameActor = createGameActor(intermediateMachines);

export const ACTOR_EVENT_BONUS_SPIN = 'BONUS_SPIN' as const;

type BonusSpinActorEvent = { type: typeof ACTOR_EVENT_BONUS_SPIN };
type GameActorEvent = Parameters<typeof gameActor.send>[0] | BonusSpinActorEvent;

export const sendGameActorEvent = (event: GameActorEvent) => {
	if (event.type === ACTOR_EVENT_BONUS_SPIN) {
		sendBonusSpin();
		return;
	}

	gameActor.send(event);
};
