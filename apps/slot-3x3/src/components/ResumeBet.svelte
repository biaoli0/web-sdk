<script lang="ts">
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	onMount(() => {
		if (stateBet.betToResume?.active && stateBet.betToResume.mode) {
			stateBet.activeBetModeKey = stateBet.betToResume.mode;
		}

		context.eventEmitter.broadcast({ type: 'resumeBet' });
	});
</script>
