<script lang="ts">
	import { stateGame } from '../game/stateGame.svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	const disabled = $derived(!context.stateXstateDerived.isIdle());
</script>

<div class="col">
	<span>REELS SPEED</span>
	<div class="row">
		<input
			bind:value={stateGame.reelSpeed}
			type="range"
			min="0"
			max="1"
			step="0.05"
			class="range"
			{disabled}
			aria-label="Reel Speed"
		/>
	</div>
</div>

<style lang="scss">
	.col {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.range {
		width: 100%;
		display: flex;
		align-items: center;
	}
</style>
