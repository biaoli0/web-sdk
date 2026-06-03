<script lang="ts">
	import { reelSpeedGameDerived, stateGame } from '../game/state/stateGame.svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	const disabled = $derived(!context.stateXstateDerived.isIdle());
	const updateReelSpeed = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		reelSpeedGameDerived.setReelSpeed(input.value);
	};
</script>

<div class="col">
	<span>REELS SPEED</span>
	<div class="row">
		<input
			value={stateGame.reelSpeed}
			type="range"
			min="0"
			max="1"
			step="0.05"
			class="range"
			{disabled}
			aria-label="Reel Speed"
			oninput={updateReelSpeed}
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
