<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BONUS/bookEvent',
	});
</script>

<script lang="ts">
	import {
		StoryGameTemplate,
		StoryLocale,
		type TemplateArgs,
		templateArgs,
	} from 'components-storybook';
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { stateGame, stateGameDerived } from '../game/state/stateGame.svelte';
	import { playBookEvent, playBookEvents } from '../game/utils';
	import type { BookEventOfType } from '../game/typesBookEvent';
	import events from './data/bonus_events';

	let manualBonusSliceIndex = 0;

	const resetBookEventStory = () => {
		stateGameDerived.clear();
		stateBet.winBookEventAmount = 0;
		manualBonusSliceIndex = 0;
	};

	const playManualBonusStep = async () => {
		if (stateGame.bonus.status === 'inactive' || stateGame.bonus.status === 'complete') {
			resetBookEventStory();
			stateGameDerived.settle(events.reveal.board);
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

{#snippet template(args: TemplateArgs<any>)}
	<StoryGameTemplate
		skipLoadingScreen={args.skipLoadingScreen}
		action={async () => {
			await args.action?.(args.data);
		}}
	>
		<StoryLocale lang="en">
			<Game />
		</StoryLocale>
	</StoryGameTemplate>
{/snippet}

<Story
	name="manual bonus flow"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.bonusSlices,
		action: playManualBonusStep,
	})}
	{template}
/>

<Story
	name="bonusTrigger"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.bonusTrigger,
		action: async (data: BookEventOfType<'bonusTrigger'>) => {
			stateGameDerived.settle(events.reveal.board);
			await playBookEvent(data, { bookEvents: events.sequence });
		},
	})}
	{template}
/>

<Story
	name="bonusReveal"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.bonusReveal1,
		action: async (data: BookEventOfType<'bonusReveal'>) => {
			stateGameDerived.settle(events.reveal.board);
			stateGameDerived.startBonus({
				positions: events.bonusTrigger.positions,
				respins: events.bonusTrigger.respins,
			});
			await playBookEvent(data, { bookEvents: events.sequence });
		},
	})}
	{template}
/>
