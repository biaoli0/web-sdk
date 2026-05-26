<script lang="ts">
	import { App, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import Board from './Board.svelte';

	const context = getContext();
</script>

<App>
	{#if context.stateApp.loaded}
		<MainContainer>
			<Board />
		</MainContainer>
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
