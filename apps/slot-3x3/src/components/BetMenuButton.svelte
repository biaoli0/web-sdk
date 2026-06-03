<script lang="ts">
	import { Container, Sprite } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { getContext } from '../game/context';

	const ICON_SIZE = 130;
	const context = getContext();
	const disabled = $derived(!context.stateXstateDerived.isIdle());

	const openBetMenu = () => {
		if (disabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'betAmountMenu' };
	};
</script>

<Container
	eventMode="static"
	cursor={disabled ? 'not-allowed' : 'pointer'}
	onpointerup={openBetMenu}
>
	<Sprite
		key="switchBet"
		anchor={0.5}
		width={ICON_SIZE}
		height={ICON_SIZE}
		alpha={disabled ? 0.5 : 1}
	/>
</Container>
