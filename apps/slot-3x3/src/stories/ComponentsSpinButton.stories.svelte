<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'COMPONENTS/<SpinButton>',
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Container } from 'pixi-svelte';
	import { StoryPixiApp } from 'components-storybook';
	import { stateBet } from 'state-shared';

	import SpinButton from '../components/SpinButton.svelte';
	import { setContext } from '../game/context';
	import { stateGameDerived } from '../game/stateGame.svelte';
	import { stateXstate } from '../game/stateXstate';

	const storyStateIdle = 'idle';

	setContext();

	onMount(() => {
		stateXstate.value = storyStateIdle;
		stateBet.balanceAmount = 10000;
		stateBet.betAmount = 1;
		stateBet.activeBetModeKey = 'BASE';
		stateBet.autoSpinsCounter = 0;
		stateBet.isSpaceHold = false;
		stateGameDerived.setReelSpeed(0);
	});
</script>

<Story name="default">
	<div class="preview">
		<StoryPixiApp
			assets={{
				uiIcons: {
					type: 'sprites',
					src: new URL('../../assets/sprites/ui/ui.json', import.meta.url).href,
					preload: true,
				},
			}}
		>
			{#if stateXstate.value === storyStateIdle}
				<Container x={220} y={180}>
					<SpinButton anchor={0.5} />
				</Container>
			{/if}
		</StoryPixiApp>
	</div>
</Story>

<style lang="scss">
	.preview {
		width: 100vw;
		height: 100vh;
		background: #161a20;
	}
</style>
