<script lang="ts">
	import { FadeContainer } from 'components-pixi';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { numberToCurrencyString } from 'utils-shared/amount';

	import { BOARD_SIZES } from '../game/constants';
	import { getContext } from '../game/context';

	const context = getContext();
	const bonusWin = $derived(numberToCurrencyString(context.stateGame.bonus.totalWin));
</script>

<FadeContainer
	show={context.stateGame.bonus.outroVisible}
	x={BOARD_SIZES.width * 0.5}
	y={BOARD_SIZES.height * 0.5}
>
	<Container>
		<Rectangle
			anchor={0.5}
			width={BOARD_SIZES.width * 0.82}
			height={230}
			borderRadius={8}
			backgroundColor={0x100916}
			backgroundAlpha={0.96}
			borderColor={0xfacc15}
			borderWidth={4}
		/>
		<Rectangle
			anchor={0.5}
			width={BOARD_SIZES.width * 0.78}
			height={190}
			borderRadius={6}
			backgroundColor={0x4a1d00}
			backgroundAlpha={0.28}
			borderColor={0xffffff}
			borderAlpha={0.18}
			borderWidth={2}
		/>
		<Text
			y={-58}
			anchor={0.5}
			text="BONUS WIN"
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 40,
				fontWeight: '900',
				fill: 0xfef08a,
				stroke: { color: 0x4a1d00, width: 5 },
			}}
		/>
		<Text
			y={34}
			anchor={0.5}
			text={bonusWin}
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 54,
				fontWeight: '900',
				fill: 0xffffff,
				stroke: { color: 0x4a1d00, width: 5 },
			}}
		/>
	</Container>
</FadeContainer>
