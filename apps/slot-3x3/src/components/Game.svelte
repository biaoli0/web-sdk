<script lang="ts">
	import { App, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { EnableHotkey } from 'components-shared';
	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import Board from './Board.svelte';
	import EnableGameActor from './EnableGameActor.svelte';

	const context = getContext();
</script>

<App>
	<EnableHotkey />
	<EnableGameActor />

	{#if context.stateApp.loaded}
		<MainContainer>
			<Board />
		</MainContainer>

		<UI>
			{#snippet gameName()}
				<UiGameName name="3X3 SLOT" />
			{/snippet}
			{#snippet logo()}
				<Text
					anchor={{ x: 1, y: 0 }}
					text="ADD YOUR LOGO"
					style={{
						fontFamily: 'proxima-nova',
						fontSize: 24,
						fontWeight: '600',
						lineHeight: 32,
						fill: 0xffffff,
					}}
				/>
			{/snippet}
		</UI>
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

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</Modals>
