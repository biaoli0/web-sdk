<script lang="ts">
	import { App, Sprite, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { EnableHotkey } from 'components-shared';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import Board from './Board.svelte';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import Sound from './Sound.svelte';
	import GameInterface from './GameInterface.svelte';

	const context = getContext();
	const layout = $derived(context.stateLayoutDerived.mainLayoutStandard());
	let soundStarted = $state(false);
</script>

<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />

	{#if context.stateApp.loaded}
		{#if soundStarted}
			<Sound />
		{/if}

		<MainContainer standard>
			<Sprite
				key="menuBackgroundLandscape"
				anchor={{ x: 0.5, y: 1 }}
				x={layout.width * 0.5}
				y={layout.height}
				width={layout.width}
				height={layout.height}
			/>
		</MainContainer>

		<MainContainer>
			<Board />
		</MainContainer>

		<GameInterface />
	{:else}
		<Text
			x={40}
			y={40}
			text="LOADING 3X3 SLOT"
			style={{
				fontFamily: 'proxima-nova',
				fontSize: 24,
				fontWeight: '700',
				fill: 0xffffff,
			}}
		/>
	{/if}
</App>

{#if context.stateApp.loaded && !soundStarted}
	<button class="sound-start" type="button" onclick={() => (soundStarted = true)}>START</button>
{/if}

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</Modals>

<style lang="scss">
	.sound-start {
		position: fixed;
		inset: 0;
		z-index: 998;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background: rgba(0, 0, 0, 0.58);
		color: #ffffff;
		cursor: pointer;
		font-family: proxima-nova, sans-serif;
		font-size: 32px;
		font-weight: 800;
		letter-spacing: 0;
	}
</style>
