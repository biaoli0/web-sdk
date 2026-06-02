<script lang="ts">
	import { Container, Rectangle, Sprite, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { stateBet, stateBetDerived, stateModal, stateSound } from 'state-shared';

	import { getContext } from '../game/context';
	import SpinButton from './SpinButton.svelte';

	type Direction = 'horizontal' | 'vertical';
	type ControlScales = {
		side: number;
		action: number;
		switchBet: number;
	};

	type Props = {
		direction: Direction;
	};

	const SOUND_BUTTON_ICON_SIZE = 110;
	const AUTO_SPIN_ICON_SIZE = 80;
	const SWITCH_BET_ICON_SIZE = 130;
	const SETTINGS_ICON_SIZE = 120;
	const CONTROL_GAP = 120;
	const CONTROL_SCALES_BY_DIRECTION = {
		horizontal: {
			side: 0.48,
			action: 0.62,
			switchBet: 0.48,
		},
		vertical: {
			side: 0.6,
			action: 0.78,
			switchBet: 0.6,
		},
	} satisfies Record<Direction, ControlScales>;

	const props: Props = $props();
	const context = getContext();
	const soundButtonSizes = $derived({
		width: SOUND_BUTTON_ICON_SIZE,
		height: SOUND_BUTTON_ICON_SIZE,
	});
	const autoSpinSizes = $derived({
		width: AUTO_SPIN_ICON_SIZE,
		height: AUTO_SPIN_ICON_SIZE,
	});
	const soundButtonKey = $derived(
		stateSound.volumeValueMaster === 0 ? 'soundButtonMuted' : 'soundButton',
	);
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
		if (stateBet.autoSpinsCounter === Infinity) return AUTO_SPIN_ICON_SIZE * 0.75;
		if (stateBet.autoSpinsCounter > 99) return AUTO_SPIN_ICON_SIZE * 0.375;
		if (stateBet.autoSpinsCounter > 9) return AUTO_SPIN_ICON_SIZE * 0.5;
		return AUTO_SPIN_ICON_SIZE * 0.625;
	});
	const betMenuDisabled = $derived(!context.stateXstateDerived.isIdle());
	const controlScales = $derived(CONTROL_SCALES_BY_DIRECTION[props.direction]);
	const controlPosition = (index: number) =>
		props.direction === 'vertical'
			? { x: 0, y: index * CONTROL_GAP }
			: { x: index * CONTROL_GAP, y: 0 };

	const stopAutoSpin = () => (stateBet.autoSpinsCounter = 0);
	const openAutoSpinModal = () => (stateModal.modal = { name: 'autoSpin' });
	const toggleSound = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueMaster = stateSound.volumeValueMaster === 0 ? 50 : 0;
	};
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

<Container {...controlPosition(-3)} scale={controlScales.side}>
	<Button anchor={0.5} sizes={soundButtonSizes} onpress={toggleSound}>
		{#snippet children({ center, hovered, pressed })}
			<Sprite
				{...center}
				key={soundButtonKey}
				anchor={0.5}
				width={SOUND_BUTTON_ICON_SIZE}
				height={SOUND_BUTTON_ICON_SIZE}
				alpha={pressed ? 0.82 : hovered ? 1 : 0.95}
			/>
		{/snippet}
	</Button>
</Container>

<Container {...controlPosition(-2)} scale={controlScales.action}>
	<Button anchor={0.5} sizes={autoSpinSizes} onpress={pressAutoSpin} disabled={autoSpinDisabled}>
		{#snippet children({ center, hovered, pressed })}
			<Sprite
				{...center}
				key="autoPlay"
				anchor={0.5}
				width={AUTO_SPIN_ICON_SIZE}
				height={AUTO_SPIN_ICON_SIZE}
				alpha={autoSpinDisabled ? 0.5 : pressed ? 0.82 : hovered ? 1 : 0.95}
			/>

			{#if autoSpinActive}
				<Rectangle
					{...center}
					anchor={0.5}
					width={AUTO_SPIN_ICON_SIZE * 0.62}
					height={AUTO_SPIN_ICON_SIZE * 0.62}
					borderRadius={AUTO_SPIN_ICON_SIZE}
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

<Container {...controlPosition(-0.5)} scale={controlScales.action * 2}>
	<SpinButton anchor={0.5} />
</Container>

<Container
	{...controlPosition(1)}
	scale={controlScales.switchBet}
	eventMode="static"
	cursor={betMenuDisabled ? 'not-allowed' : 'pointer'}
	onpointerup={openBetMenu}
>
	<Sprite
		key="switchBet"
		anchor={0.5}
		width={SWITCH_BET_ICON_SIZE}
		height={SWITCH_BET_ICON_SIZE}
		alpha={betMenuDisabled ? 0.5 : 1}
	/>
</Container>

<Container
	{...controlPosition(2)}
	scale={controlScales.side}
	eventMode="static"
	cursor="pointer"
	onpointerup={openSettings}
>
	<Sprite key="settingsMenu" anchor={0.5} width={SETTINGS_ICON_SIZE} height={SETTINGS_ICON_SIZE} />
</Container>
