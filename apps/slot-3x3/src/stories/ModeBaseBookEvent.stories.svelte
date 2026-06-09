<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'MODE_BASE/bookEvent',
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';

	import { setContext } from '../game/context';
	import { winGameDerived } from '../game/state/stateGame.svelte';
	import { playBookEvent } from '../game/utils';
	import BookEventStory from './BookEventStory.svelte';
	import events from './data/base_events';

	const resetBookEventStory = () => {
		winGameDerived.clear();
		stateBet.winBookEventAmount = 0;
	};

	setContext();
	onMount(resetBookEventStory);
</script>

<Story name="reveal">
	<BookEventStory action={async () => await playBookEvent(events.reveal, { bookEvents: [] })} />
</Story>

<Story name="setTotalWin">
	<BookEventStory action={async () => await playBookEvent(events.setTotalWin, { bookEvents: [] })} />
</Story>

<Story name="winInfo">
	<BookEventStory action={async () => await playBookEvent(events.winInfo, { bookEvents: [] })} />
</Story>

<Story name="finalWin">
	<BookEventStory action={async () => await playBookEvent(events.finalWin, { bookEvents: [] })} />
</Story>
