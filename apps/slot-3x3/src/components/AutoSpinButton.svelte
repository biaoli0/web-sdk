<script lang="ts">
	import { Rectangle, Sprite, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';

	import { getContext } from '../game/context';

	const ICON_SIZE = 80;
	const sizes = {
		width: ICON_SIZE,
		height: ICON_SIZE,
	};
	const context = getContext();
	const autoSpinActive = $derived(stateBetDerived.hasAutoBetCounter());
	const disabled = $derived.by(() => {
		if (stateBet.isSpaceHold) return true;
		if (!context.stateXstateDerived.isIdle() && !stateBetDerived.hasAutoBetCounter()) return true;
		if (!stateBetDerived.isBetCostAvailable()) return true;
		return false;
	});
	const counterText = $derived(
		stateBet.autoSpinsCounter === Infinity ? '\u221e' : String(stateBet.autoSpinsCounter),
	);
	const counterFontSize = $derived.by(() => {
		if (stateBet.autoSpinsCounter === Infinity) return ICON_SIZE * 0.75;
		if (stateBet.autoSpinsCounter > 99) return ICON_SIZE * 0.375;
		if (stateBet.autoSpinsCounter > 9) return ICON_SIZE * 0.5;
		return ICON_SIZE * 0.625;
	});

	const stopAutoSpin = () => (stateBet.autoSpinsCounter = 0);
	const openAutoSpinModal = () => (stateModal.modal = { name: 'autoSpin' });
	const press = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.hasAutoBetCounter() ? stopAutoSpin() : openAutoSpinModal();
	};
</script>

<Button anchor={0.5} {sizes} onpress={press} {disabled}>
	{#snippet children({ center, hovered, pressed })}
		<Sprite
			{...center}
			key="autoPlay"
			anchor={0.5}
			width={ICON_SIZE}
			height={ICON_SIZE}
			alpha={disabled ? 0.5 : pressed ? 0.82 : hovered ? 1 : 0.95}
		/>

		{#if autoSpinActive}
			<Rectangle
				{...center}
				anchor={0.5}
				width={ICON_SIZE * 0.62}
				height={ICON_SIZE * 0.62}
				borderRadius={ICON_SIZE}
				backgroundColor={0x000000}
				backgroundAlpha={0.78}
			/>
			<Text
				{...center}
				anchor={0.5}
				text={counterText}
				style={{
					fontFamily: 'proxima-nova',
					fill: 0xffffff,
					fontWeight: 'bold',
					fontSize: counterFontSize,
				}}
			/>
		{/if}
	{/snippet}
</Button>
