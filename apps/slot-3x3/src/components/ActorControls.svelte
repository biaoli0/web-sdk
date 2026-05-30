<script lang="ts">
	import { Container, Rectangle, Sprite, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { ButtonSoundSwitch } from 'components-ui-pixi';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';

	import { getContext } from '../game/context';
	import SpinButton from './SpinButton.svelte';

	type Direction = 'horizontal' | 'vertical';

	type Props = {
		direction: Direction;
		gap: number;
		sideScale: number;
		actionScale: number;
		switchBetScale: number;
		autoSpinIconSize: number;
		switchBetIconSize: number;
		settingsIconSize?: number;
	};

	const props: Props = $props();
	const context = getContext();
	const settingsIconSize = $derived(props.settingsIconSize ?? props.switchBetIconSize);
	const autoSpinSizes = $derived({
		width: props.autoSpinIconSize,
		height: props.autoSpinIconSize,
	});
	const autoSpinActive = $derived(stateBetDerived.hasAutoBetCounter());
	const autoSpinDisabled = $derived.by(() => {
		if (stateBet.isSpaceHold) return true;
		if (!context.stateXstateDerived.isIdle() && !stateBetDerived.hasAutoBetCounter()) return true;
		if (!stateBetDerived.isBetCostAvailable()) return true;
		return false;
	});
	const autoSpinCounterText = $derived(
		stateBet.autoSpinsCounter === Infinity ? '\u221e' : String(stateBet.autoSpinsCounter),
	);
	const autoSpinCounterFontSize = $derived.by(() => {
		if (stateBet.autoSpinsCounter === Infinity) return props.autoSpinIconSize * 0.75;
		if (stateBet.autoSpinsCounter > 99) return props.autoSpinIconSize * 0.375;
		if (stateBet.autoSpinsCounter > 9) return props.autoSpinIconSize * 0.5;
		return props.autoSpinIconSize * 0.625;
	});
	const betMenuDisabled = $derived(!context.stateXstateDerived.isIdle());
	const controlPosition = (index: number) =>
		props.direction === 'vertical' ? { y: index * props.gap } : { x: index * props.gap };

	const stopAutoSpin = () => (stateBet.autoSpinsCounter = 0);
	const openAutoSpinModal = () => (stateModal.modal = { name: 'autoSpin' });
	const pressAutoSpin = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.hasAutoBetCounter() ? stopAutoSpin() : openAutoSpinModal();
	};

	const openBetMenu = () => {
		if (betMenuDisabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'betAmountMenu' };
	};

	const openSettings = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'settings' };
	};
</script>

<Container {...controlPosition(-3)} scale={props.sideScale}>
	<ButtonSoundSwitch anchor={0.5} />
</Container>

<Container {...controlPosition(-2)} scale={props.actionScale}>
	<Button anchor={0.5} sizes={autoSpinSizes} onpress={pressAutoSpin} disabled={autoSpinDisabled}>
		{#snippet children({ center, hovered, pressed })}
			<Sprite
				{...center}
				key="autoPlay"
				anchor={0.5}
				width={props.autoSpinIconSize}
				height={props.autoSpinIconSize}
				alpha={autoSpinDisabled ? 0.5 : pressed ? 0.82 : hovered ? 1 : 0.95}
			/>

			{#if autoSpinActive}
				<Rectangle
					{...center}
					anchor={0.5}
					width={props.autoSpinIconSize * 0.62}
					height={props.autoSpinIconSize * 0.62}
					borderRadius={props.autoSpinIconSize}
					backgroundColor={0x000000}
					backgroundAlpha={0.78}
				/>
				<Text
					{...center}
					anchor={0.5}
					text={autoSpinCounterText}
					style={{
						fontFamily: 'proxima-nova',
						fill: 0xffffff,
						fontWeight: 'bold',
						fontSize: autoSpinCounterFontSize,
					}}
				/>
			{/if}
		{/snippet}
	</Button>
</Container>

<Container {...controlPosition(-0.5)} scale={props.actionScale * 2}>
	<SpinButton anchor={0.5} />
</Container>

<Container
	{...controlPosition(1)}
	scale={props.switchBetScale}
	eventMode="static"
	cursor={betMenuDisabled ? 'not-allowed' : 'pointer'}
	onpointerup={openBetMenu}
>
	<Sprite
		key="switchBet"
		anchor={0.5}
		width={props.switchBetIconSize}
		height={props.switchBetIconSize}
		alpha={betMenuDisabled ? 0.5 : 1}
	/>
</Container>

<Container
	{...controlPosition(2)}
	scale={props.sideScale}
	eventMode="static"
	cursor="pointer"
	onpointerup={openSettings}
>
	<Sprite key="settingsMenu" anchor={0.5} width={settingsIconSize} height={settingsIconSize} />
</Container>
