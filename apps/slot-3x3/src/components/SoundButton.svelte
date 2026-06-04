<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { stateSound } from 'state-shared';

	import { getContext } from '../game/context';

	const ICON_SIZE = 110;
	const sizes = {
		width: ICON_SIZE,
		height: ICON_SIZE,
	};
	const context = getContext();
	const soundButtonKey = $derived(
		stateSound.volumeValueMaster === 0 ? 'soundButtonMuted' : 'soundButton',
	);

	const toggleSound = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueMaster = stateSound.volumeValueMaster === 0 ? 50 : 0;
	};
</script>

<Button anchor={0.5} {sizes} onpress={toggleSound}>
	{#snippet children({ center, hovered, pressed })}
		<Sprite
			{...center}
			key={soundButtonKey}
			anchor={0.5}
			width={ICON_SIZE}
			height={ICON_SIZE}
			alpha={pressed ? 0.82 : hovered ? 1 : 0.95}
		/>
	{/snippet}
</Button>
