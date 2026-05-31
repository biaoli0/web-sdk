<script lang="ts">
	import { Container, Text, type Sizes } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { OnHotkey } from 'components-shared';

	import { getContext } from '../game/context';
	import { EVENT_BONUS_SPIN } from '../game/typesEmitterEvent';

	type Props = {
		sizes: Sizes;
		debug?: boolean;
	};

	const props: Props = $props();
	const context = getContext();

	const disabled = $derived(
		context.stateGame.bonus.status !== 'active' ||
			context.stateGame.bonus.introVisible ||
			context.stateGame.bonus.isSpinning ||
			context.stateGame.bonus.respins <= 0 ||
			context.stateGameDerived.isSpinning(),
	);
	const hotkeyDisabled = $derived(!context.stateXstateDerived.isIdle() || disabled);

	const press = () => {
		if (disabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressBet' });
		context.eventEmitter.broadcast({ type: EVENT_BONUS_SPIN });
	};
</script>

<OnHotkey hotkey="Space" disabled={hotkeyDisabled} onpress={press} />

<Button sizes={props.sizes} onpress={press} {disabled} debug={props.debug}>
	{#snippet children({ center, hovered, pressed })}
		<Container {...center} alpha={disabled ? 0.56 : pressed ? 0.84 : hovered ? 1 : 0.96}>
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
		</Container>
	{/snippet}
</Button>
