<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BONUS/bookEvent',
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';

	import { setContext } from '../game/context';
	import {
		boardGameDerived,
		bonusGameDerived,
		stateGame,
		winGameDerived,
	} from '../game/state/stateGame.svelte';
	import { playBookEvent, playBookEvents } from '../game/utils';
	import BookEventStory from './BookEventStory.svelte';
	import events from './data/bonus_events';

	let manualBonusSliceIndex = 0;

	const resetBookEventStory = () => {
		winGameDerived.clear();
		stateBet.winBookEventAmount = 0;
		manualBonusSliceIndex = 0;
	};

	const playManualBonusStep = async () => {
		if (stateGame.bonus.status === 'inactive' || stateGame.bonus.status === 'complete') {
			resetBookEventStory();
			boardGameDerived.settle(events.reveal.board);
			await playBookEvent(events.bonusTrigger, { bookEvents: events.sequence });
			return;
		}

		const bonusSlice = events.bonusSlices[manualBonusSliceIndex];
		if (!bonusSlice) return;

		stateGame.bonus.isSpinning = true;
		try {
			await playBookEvents(bonusSlice);
		} finally {
			stateGame.bonus.isSpinning = false;
		}
		manualBonusSliceIndex += 1;
	};

	setContext();
	onMount(resetBookEventStory);
</script>

<Story name="manual bonus flow">
	<BookEventStory action={playManualBonusStep} />
</Story>

<Story name="bonusTrigger">
	<BookEventStory
		action={async () => {
			boardGameDerived.settle(events.reveal.board);
			await playBookEvent(events.bonusTrigger, { bookEvents: events.sequence });
		}}
	/>
</Story>

<Story name="bonusReveal">
	<BookEventStory
		action={async () => {
			boardGameDerived.settle(events.reveal.board);
			bonusGameDerived.startBonus({
				positions: events.bonusTrigger.positions,
				respins: events.bonusTrigger.respins,
			});
			await playBookEvent(events.bonusReveal1, { bookEvents: events.sequence });
		}}
	/>
</Story>
