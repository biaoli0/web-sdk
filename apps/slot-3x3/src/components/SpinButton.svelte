<script lang="ts">
	import { Container, Rectangle, Sprite, anchorToPivot } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBet, stateBetDerived } from 'state-shared';

	import { getContext } from '../game/context';

	type Props = Partial<Omit<ButtonProps, 'children' | 'sizes' | 'onpress' | 'disabled'>>;
	type PointerEventLike = { stopPropagation: () => void };
	type ButtonKey = 'spin_default' | 'spin_disabled' | 'stop_default' | 'stop_disabled';

	const { anchor, debug, ...containerProps }: Props = $props();
	const context = getContext();
	const sizes = { width: 160, height: 150 };
	const iconOffsetX = sizes.width * -0.08;
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
	const isSpinning = $derived(context.stateGameDerived.isSpinning());
	const lightningDisabled = $derived(!isIdle);
	const lightningKey = $derived(
		stateBet.isTurbo ? 'spinButtonLightningActive' : 'spinButtonLightning',
	);
	const lightningScale = $derived(lightningHovered && !lightningDisabled ? 1.1 : 1);
	const autoSpinActive = $derived(stateBetDerived.hasAutoBetCounter());
	const showAutoSpinStop = $derived(isSpinning && autoSpinActive);
	const mainIconKey = $derived(showAutoSpinStop ? 'spinButtonStop' : 'spinButtonArrow');

	const key = $derived.by((): ButtonKey => {
		if (isIdle) {
			if (!stateBetDerived.isBetCostAvailable()) return 'spin_disabled';
			return 'spin_default';
		}

		return showAutoSpinStop && !stopDisabled ? 'stop_default' : 'stop_disabled';
	});
	const mainDisabled = $derived(['spin_disabled', 'stop_disabled'].includes(key));

	const bet = () => {
		if (stateBetDerived.activeBetMode()?.type === 'buy') stateBet.activeBetModeKey = 'BASE';
		context.eventEmitter.broadcast({ type: 'bet' });
	};

	const stop = () => {
		if (stopDisabled) return;

		stateBet.autoSpinsCounter = 0;
		stopDisabled = true;
	};

	const pressMain = () => {
		if (mainDisabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressBet' });

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
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => {
			stopDisabled = false;
			stateBetDerived.updateIsTurbo(false, { persistent: false });
		},
	});
</script>

<OnHotkey hotkey="Space" disabled={!isIdle || mainDisabled} onpress={pressMain} />

<Container {...containerProps} pivot={anchorToPivot({ sizes, anchor })}>
	<Button {sizes} onpress={pressMain} disabled={mainDisabled} {debug}>
		{#snippet children({ center, hovered, pressed })}
			<Container {...center} alpha={mainDisabled ? 0.56 : pressed ? 0.84 : hovered ? 1 : 0.96}>
				<Sprite
					key={mainIconKey}
					anchor={0.5}
					eventMode="static"
					cursor="pointer"
					rotation={arrowHovered && !showAutoSpinStop ? (20 * Math.PI) / 180 : 0}
					width={showAutoSpinStop ? sizes.height * 0.56 : sizes.width * 0.68}
					height={showAutoSpinStop ? sizes.height * 0.56 : sizes.height * 0.6}
					onpointerover={() => {
						arrowHovered = true;
					}}
					onpointerout={() => {
						arrowHovered = false;
					}}
				/>
			</Container>
		{/snippet}
	</Button>

	<Container {...center}>
		<Sprite
			key={lightningKey}
			anchor={0.5}
			x={iconOffsetX}
			width={sizes.width * lightningScale}
			height={sizes.height * lightningScale}
			alpha={lightningDisabled ? 0.5 : context.stateGameDerived.isTurbo() ? 1 : 0.9}
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
</Container>
