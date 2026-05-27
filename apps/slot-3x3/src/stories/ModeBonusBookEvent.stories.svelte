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
	import { stateGameDerived } from '../game/stateGame.svelte';
	import { playBookEvent, playBookEvents } from '../game/utils';
	import type { BookEvent, BookEventOfType } from '../game/typesBookEvent';
	import events from './data/bonus_events';

	const resetBookEventStory = () => {
		stateGameDerived.clear();
		stateBet.winBookEventAmount = 0;
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
	name="bonus sequence"
	args={templateArgs({
		skipLoadingScreen: true,
		data: events.sequence,
		action: async (data: BookEvent[]) => await playBookEvents(data),
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
