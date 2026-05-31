<script lang="ts">
	import { Container, Rectangle, Sprite, Text } from 'pixi-svelte';
	import { numberToCurrencyString } from 'utils-shared/amount';

	import { SYMBOL_HEIGHT, SYMBOL_TEXTURE_MAP, SYMBOL_WIDTH } from '../game/constants';
	import { SYMBOL_NAME } from '../game/symbols';
	import type { RawSymbol, SymbolState } from '../game/types';

	type Props = {
		x: number;
		y: number;
		rawSymbol: RawSymbol;
		symbolState: SymbolState;
		highlight?: boolean;
		newCoin?: boolean;
		dimmed?: boolean;
	};

	const props: Props = $props();

	const texture = $derived(SYMBOL_TEXTURE_MAP[props.rawSymbol.name]);
	const textureKey = $derived(props.dimmed ? texture.dark : texture.normal);
	const tileAlpha = $derived(props.highlight ? 0.38 : 0.18);
	const coinAmount = $derived(
		props.rawSymbol.name === SYMBOL_NAME.VALUE_COIN ? props.rawSymbol.amount : undefined,
	);
	const coinText = $derived(coinAmount !== undefined ? numberToCurrencyString(coinAmount) : '');
</script>

<Container x={props.x} y={props.y}>
	<Rectangle
		anchor={0.5}
		width={SYMBOL_WIDTH}
		height={SYMBOL_HEIGHT}
		borderRadius={8}
		backgroundColor={props.highlight ? 0x2dd4bf : 0x150f24}
		backgroundAlpha={tileAlpha}
		borderColor={props.newCoin ? 0xffffff : props.highlight ? 0xfef08a : 0x6b4c9a}
		borderWidth={props.newCoin ? 6 : props.highlight ? 4 : 2}
		borderAlpha={props.highlight ? 1 : 0.55}
	/>
	<Sprite
		anchor={0.5}
		key={textureKey}
		width={SYMBOL_HEIGHT * texture.sizeRatios.width}
		height={SYMBOL_HEIGHT * texture.sizeRatios.height}
		alpha={props.symbolState === 'spin' ? 0.72 : 1}
	/>
	{#if coinAmount !== undefined}
		<Text
			anchor={0.5}
			text={coinText}
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 26,
				fontWeight: '900',
				fill: 0xffffff,
				stroke: { color: 0x5f3000, width: 5 },
			}}
		/>
	{/if}
</Container>
