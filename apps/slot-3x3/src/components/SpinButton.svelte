<script lang="ts">
	import { Container, Rectangle, Sprite, Text, anchorToPivot } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBet, stateBetDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import {
		boardGameDerived,
		bonusGameDerived,
		reelSpeedGameDerived,
	} from '../game/state/stateGame.svelte';

	type Props = Partial<Omit<ButtonProps, 'children' | 'sizes' | 'onpress' | 'disabled'>>;
	type PointerEventLike = { stopPropagation: () => void };
	const BUTTON_KEY = {
		SPIN_DEFAULT: 'spin_default',
		SPIN_DISABLED: 'spin_disabled',
		STOP_DEFAULT: 'stop_default',
		STOP_DISABLED: 'stop_disabled',
	} as const;
	type ButtonKey = (typeof BUTTON_KEY)[keyof typeof BUTTON_KEY];
	const DISABLED_BUTTON_KEYS = new Set<ButtonKey>([
		BUTTON_KEY.SPIN_DISABLED,
		BUTTON_KEY.STOP_DISABLED,
	]);

	const { anchor, debug, ...containerProps }: Props = $props();
	const context = getContext();
	const sizes = { width: 160, height: 150 };
	const iconOffsetX = sizes.width * -0.08;
	const stopIconSize = sizes.height * 0.42;
	const center = {
		x: sizes.width * 0.5,
		y: sizes.height * 0.5,
	};
	const lightningHitArea = {
		x: sizes.width * -0.47,
		width: sizes.width * 0.2,
		height: sizes.height * 0.3,
	};

	let arrowHovered = $state(false);
	let lightningHovered = $state(false);

	const isIdle = $derived(context.stateXstateDerived.isIdle());
	const isSpinning = $derived(boardGameDerived.isSpinning());
	const isBonusActive = $derived(context.stateGame.bonus.status === 'active');
	const bonusSpinUnavailable = $derived(!bonusGameDerived.canBonusSpin());
	const lightningDisabled = $derived(!isIdle || isBonusActive);
	const lightningKey = $derived(
		reelSpeedGameDerived.isTurbo() ? 'spinButtonLightningActive' : 'spinButtonLightning',
	);
	const lightningScale = $derived(lightningHovered && !lightningDisabled ? 1.1 : 1);
	const autoSpinActive = $derived(stateBetDerived.hasAutoBetCounter());
	const showAutoSpinStop = $derived(isSpinning && autoSpinActive);
	const mainIconKey = $derived(showAutoSpinStop ? 'spinButtonStop' : 'spinButtonArrow');

	const key = $derived.by((): ButtonKey => {
		if (isIdle) {
			if (!stateBetDerived.isBetCostAvailable()) return BUTTON_KEY.SPIN_DISABLED;
			return BUTTON_KEY.SPIN_DEFAULT;
		}

		return showAutoSpinStop ? BUTTON_KEY.STOP_DEFAULT : BUTTON_KEY.STOP_DISABLED;
	});
	const mainDisabled = $derived(
		isBonusActive ? bonusSpinUnavailable : DISABLED_BUTTON_KEYS.has(key),
	);
	const getMainContainerAlpha = (pressed: boolean, hovered: boolean) => {
		if (mainDisabled) return 0.56;
		if (pressed) return 0.84;
		if (hovered) return 1;
		return 1;
	};

	const bet = () => {
		if (stateBetDerived.activeBetMode()?.type === 'buy') stateBet.activeBetModeKey = 'BASE';
		context.eventEmitter.broadcast({ type: 'bet' });
	};

	const stop = () => {
		stateBet.autoSpinsCounter = 0;
	};

	const pressMain = () => {
		if (mainDisabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressBet' });

		if (isBonusActive) {
			context.eventEmitter.broadcast({ type: 'bonusSpin' });
			return;
		}

		if (isIdle) {
			bet();
		} else {
			stop();
		}
	};

	const pressLightning = (event: PointerEventLike) => {
		event.stopPropagation();

		if (lightningDisabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		reelSpeedGameDerived.toggleTurbo();
	};
</script>

<OnHotkey hotkey="Space" disabled={!isIdle || mainDisabled} onpress={pressMain} />

<Container {...containerProps} pivot={anchorToPivot({ sizes, anchor })}>
	<Container {...center}>
		<Sprite
			key={lightningKey}
			anchor={0.5}
			x={iconOffsetX}
			width={sizes.width * lightningScale}
			height={sizes.height * lightningScale}
			alpha={lightningDisabled ? 0.5 : reelSpeedGameDerived.isTurbo() ? 1 : 0.9}
		/>

		<Container
			x={lightningHitArea.x}
			eventMode="static"
			cursor={lightningDisabled ? 'not-allowed' : 'pointer'}
			onpointerover={(event) => {
				event.stopPropagation();
				lightningHovered = true;
			}}
			onpointerout={(event) => {
				event.stopPropagation();
				lightningHovered = false;
			}}
			onpointerdown={(event) => {
				event.stopPropagation();
			}}
			onpointerup={pressLightning}
		>
			<Rectangle
				anchor={0.5}
				width={lightningHitArea.width}
				height={lightningHitArea.height}
				borderRadius={sizes.width}
				backgroundColor={0x000000}
				backgroundAlpha={0.001}
			/>
		</Container>
	</Container>
	
	<Button {sizes} onpress={pressMain} disabled={mainDisabled} {debug}>
		{#snippet children({ center, hovered, pressed })}
			<Container {...center} alpha={getMainContainerAlpha(pressed, hovered)}>
				{#if isBonusActive}
					<Text
						anchor={0.5}
						y={-18}
						text="RESPINS"
						style={{
							align: 'center',
							fontFamily: 'proxima-nova',
							fontSize: 26,
							fontWeight: '900',
							fill: 0xffffff,
							stroke: { color: 0x2b1240, width: 5 },
						}}
					/>
					<Text
						anchor={0.5}
						y={28}
						text={String(context.stateGame.bonus.respins)}
						style={{
							align: 'center',
							fontFamily: 'proxima-nova',
							fontSize: 58,
							fontWeight: '900',
							fill: 0xfef08a,
							stroke: { color: 0x2b1240, width: 6 },
						}}
					/>
				{:else}
					<Sprite
						key={mainIconKey}
						anchor={0.5}
						eventMode="static"
						cursor="pointer"
						rotation={arrowHovered && !showAutoSpinStop ? (20 * Math.PI) / 180 : 0}
						width={showAutoSpinStop ? stopIconSize : sizes.width * 0.68}
						height={showAutoSpinStop ? stopIconSize : sizes.height * 0.6}
						onpointerover={() => {
							arrowHovered = true;
						}}
						onpointerout={() => {
							arrowHovered = false;
						}}
					/>
				{/if}
			</Container>
		{/snippet}
	</Button>


</Container>
