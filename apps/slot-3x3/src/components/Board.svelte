<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { numberToCurrencyString } from 'utils-shared/amount';

	import {
		BOARD_GAP,
		BOARD_ROWS,
		BOARD_SIZES,
		SYMBOL_HEIGHT,
		SYMBOL_WIDTH,
	} from '../game/constants';
	import { getContext } from '../game/context';
	import { SYMBOL_NAME } from '../game/symbols';
	import type { LineWin, Position } from '../game/types';
	import BonusIntro from './BonusIntro.svelte';
	import BonusOutro from './BonusOutro.svelte';
	import RoundWin from './RoundWin.svelte';
	import Symbol from './Symbol.svelte';

	const context = getContext();

	const cellCenter = (index: number) => index * (SYMBOL_WIDTH + BOARD_GAP) + SYMBOL_WIDTH * 0.5;

	const isWinningPosition = (position: Position) =>
		context.stateGame.wins.some((win: LineWin) =>
			win.positions.some(
				(winPosition) => winPosition.reel === position.reel && winPosition.row === position.row,
			),
		);

	const isDimmedPosition = (position: Position) =>
		context.stateGame.wins.length > 0 && !isWinningPosition(position);

	const isBonusCoin = (rawSymbolName: string) =>
		context.stateGame.bonus.status !== 'inactive' &&
		(rawSymbolName === SYMBOL_NAME.VALUE_COIN || rawSymbolName === SYMBOL_NAME.EMPTY_COIN);

	const getMessage = () => {
		if (context.stateGameDerived.isSpinning()) return 'SPINNING';
		if (context.stateGame.bonus.status === 'complete') return 'BONUS COMPLETE';
		if (context.stateGame.bonus.status === 'active') return 'BONUS GAME';
		return 'READY';
	};

	const getBonusMessage = () => {
		if (context.stateGame.bonus.status === 'inactive') return '';
		if (context.stateGame.bonus.status === 'complete') {
			return `BONUS WIN ${numberToCurrencyString(context.stateGame.bonus.totalWin)}`;
		}
		return `RESPINS ${context.stateGame.bonus.respins} | COINS ${numberToCurrencyString(context.stateGame.bonus.totalWin)}`;
	};

	const showRoundWin = () => context.stateGame.totalWin > 0 && context.stateGame.wins.length > 0;

	context.stateGameDerived.enhancedBoard.readyToSpinEffect();
</script>

<Container
	x={(context.stateLayoutDerived.mainLayout().width - BOARD_SIZES.width) * 0.5}
	y={(context.stateLayoutDerived.mainLayout().height - BOARD_SIZES.height) * 0.5 - 28}
>
	<Rectangle
		x={-22}
		y={-74}
		width={BOARD_SIZES.width + 44}
		height={BOARD_SIZES.height + 126}
		borderRadius={8}
		backgroundColor={0x0b0712}
		backgroundAlpha={0.86}
		borderColor={0xd6a54a}
		borderWidth={3}
	/>

	<Text
		x={BOARD_SIZES.width * 0.5}
		y={-48}
		anchor={0.5}
		text={getMessage()}
		style={{
			align: 'center',
			fontFamily: 'proxima-nova',
			fontSize: 28,
			fontWeight: '700',
			fill: context.stateGame.totalWin > 0 ? 0xfef08a : 0xffffff,
		}}
	/>

	<Container>
		<Rectangle isMask width={BOARD_SIZES.width} height={BOARD_SIZES.height} />

		{#each context.stateGame.board as reel, reelIndex (reelIndex)}
			{#each reel.reelState.symbols as reelSymbol, rowIndex (reelSymbol.id)}
				<Symbol
					x={cellCenter(reelIndex)}
					y={context.stateGameDerived.visibleSymbolY(reelSymbol)}
					rawSymbol={reelSymbol.rawSymbol}
					symbolState={reelSymbol.symbolState}
					highlight={isWinningPosition({ reel: reelIndex, row: rowIndex }) ||
						isBonusCoin(reelSymbol.rawSymbol.name)}
					newCoin={context.stateGameDerived.isBonusNewCoinPosition({
						reel: reelIndex,
						row: rowIndex,
					})}
					dimmed={isDimmedPosition({ reel: reelIndex, row: rowIndex })}
				/>
			{/each}
		{/each}

		{#each Array(BOARD_ROWS - 1) as _, rowIndex}
			<Rectangle
				x={0}
				y={(rowIndex + 1) * SYMBOL_HEIGHT + rowIndex * BOARD_GAP + BOARD_GAP * 0.5 - 1}
				width={BOARD_SIZES.width}
				height={2}
				backgroundColor={0xffffff}
				backgroundAlpha={0.08}
			/>
		{/each}
	</Container>

	<BonusIntro />
	<BonusOutro />

	{#if showRoundWin()}
		<Container x={BOARD_SIZES.width * 0.5} y={BOARD_SIZES.height * 0.5}>
			<RoundWin />
		</Container>
	{/if}

	{#if context.stateGame.bonus.status !== 'inactive'}
		<Text
			x={BOARD_SIZES.width * 0.5}
			y={BOARD_SIZES.height + 36}
			anchor={0.5}
			text={getBonusMessage()}
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 24,
				fontWeight: '800',
				fill: 0xfef08a,
			}}
		/>
	{/if}
</Container>
