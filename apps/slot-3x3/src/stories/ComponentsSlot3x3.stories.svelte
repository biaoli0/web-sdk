<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'COMPONENTS/Slot 3x3',
		tags: ['test'],
	});
</script>

<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';

	import ActorControls from '../components/ActorControls.svelte';
	import Board from '../components/Board.svelte';
	import BonusIntro from '../components/BonusIntro.svelte';
	import BonusOutro from '../components/BonusOutro.svelte';
	import BonusSpinButton from '../components/BonusSpinButton.svelte';
	import EnableGameActor from '../components/EnableGameActor.svelte';
	import EnableSound from '../components/EnableSound.svelte';
	import GameInterface from '../components/GameInterface.svelte';
	import ModalSettings from '../components/ModalSettings.svelte';
	import Modals from '../components/Modals.svelte';
	import MoneyMeter from '../components/MoneyMeter.svelte';
	import OverallBetInfo from '../components/OverallBetInfo.svelte';
	import ReelSpeedSetting from '../components/ReelSpeedSetting.svelte';
	import RoundWin from '../components/RoundWin.svelte';
	import SpinButton from '../components/SpinButton.svelte';
	import Symbol from '../components/Symbol.svelte';
	import {
		BOARD_SIZES,
		MAIN_SIZES,
		SYMBOL_HEIGHT,
		SYMBOL_NAMES,
		SYMBOL_WIDTH,
	} from '../game/constants';
	import { SYMBOL_NAME } from '../game/symbols';
	import type { SymbolState } from '../game/types';
	import Slot3x3SoundHarness from './Slot3x3SoundHarness.svelte';
	import Slot3x3StoryFrame from './Slot3x3StoryFrame.svelte';
	import {
		expectBetMenuModal,
		expectPixiCanvas,
		expectReelSpeedSetting,
		expectSettingsModal,
	} from './storyPlayTests';
	import {
		rawSymbolFor,
		resetSlot3x3StoryState,
		setupAutoSpinControlsStory,
		setupBetMenuModalStory,
		setupBonusActiveStory,
		setupBonusIntroStory,
		setupBonusOutroStory,
		setupMoneyStory,
		setupReadyBoardStory,
		setupSettingsModalStory,
		setupWinningBoardStory,
	} from './storyState';

	const SYMBOL_STATES: SymbolState[] = ['static', 'spin', 'land'];
	const SYMBOL_COLUMN_GAP = SYMBOL_WIDTH + 92;
	const SYMBOL_ROW_GAP = SYMBOL_HEIGHT + 40;
	const SYMBOL_GALLERY_SCALE = 0.52;
	const BOARD_STORY_ORIGIN = {
		x: (MAIN_SIZES.desktop.width - BOARD_SIZES.width) * 0.5,
		y: (MAIN_SIZES.desktop.height - BOARD_SIZES.height) * 0.5 - 28,
	};
	const BONUS_SPIN_BUTTON_SIZES = { width: 160, height: 150 };
</script>

<Story name="<Symbol> gallery" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={resetSlot3x3StoryState}>
		<Container x={72} y={82} scale={SYMBOL_GALLERY_SCALE}>
			{#each SYMBOL_NAMES as symbolName, rowIndex}
				<Text
					x={0}
					y={rowIndex * SYMBOL_ROW_GAP}
					anchor={{ x: 0, y: 0.5 }}
					text={symbolName}
					style={{
						fontFamily: 'proxima-nova',
						fontSize: 26,
						fontWeight: '800',
						fill: 0xffffff,
					}}
				/>

				{#each SYMBOL_STATES as symbolState, columnIndex}
					{@const isCoin = symbolName === SYMBOL_NAME.VALUE_COIN}
					{@const isEmptyCoin = symbolName === SYMBOL_NAME.EMPTY_COIN}
					<Container x={260 + columnIndex * SYMBOL_COLUMN_GAP} y={rowIndex * SYMBOL_ROW_GAP}>
						<Text
							y={-86}
							anchor={0.5}
							text={symbolState}
							style={{
								fontFamily: 'proxima-nova',
								fontSize: 22,
								fontWeight: '700',
								fill: 0xd1d5db,
							}}
						/>
						<Symbol
							x={0}
							y={0}
							rawSymbol={rawSymbolFor(symbolName)}
							{symbolState}
							highlight={symbolState === 'land' || isCoin}
							newCoin={isCoin && symbolState === 'land'}
							dimmed={symbolState === 'spin' && !isEmptyCoin}
						/>
					</Container>
				{/each}
			{/each}
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<Board> ready" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupReadyBoardStory}>
		<MainContainer>
			<Board />
		</MainContainer>
	</Slot3x3StoryFrame>
</Story>

<Story name="<Board> win" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupWinningBoardStory}>
		<MainContainer>
			<Board />
		</MainContainer>
	</Slot3x3StoryFrame>
</Story>

<Story name="<Board> bonus" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupBonusActiveStory}>
		<MainContainer>
			<Board />
		</MainContainer>
	</Slot3x3StoryFrame>
</Story>

<Story name="<BonusIntro>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupBonusIntroStory}>
		<MainContainer>
			<Container x={BOARD_STORY_ORIGIN.x} y={BOARD_STORY_ORIGIN.y}>
				<BonusIntro />
			</Container>
		</MainContainer>
	</Slot3x3StoryFrame>
</Story>

<Story name="<BonusOutro>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupBonusOutroStory}>
		<MainContainer>
			<Container x={BOARD_STORY_ORIGIN.x} y={BOARD_STORY_ORIGIN.y}>
				<BonusOutro />
			</Container>
		</MainContainer>
	</Slot3x3StoryFrame>
</Story>

<Story name="<RoundWin>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupWinningBoardStory}>
		<Container x={600} y={300}>
			<RoundWin />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<MoneyMeter>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupMoneyStory}>
		<Container x={230} y={170} scale={0.82}>
			<MoneyMeter kind="win" stacked />
		</Container>
		<Container x={520} y={170} scale={0.82}>
			<MoneyMeter kind="bet" stacked />
		</Container>
		<Container x={810} y={170} scale={0.82}>
			<MoneyMeter kind="balance" stacked />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<OverallBetInfo>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupMoneyStory}>
		<Container x={600} y={180}>
			<OverallBetInfo gap={300} itemScale={0.78} />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<ActorControls>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupAutoSpinControlsStory}>
		<Container x={500} y={310}>
			<ActorControls direction="horizontal" />
		</Container>

		<Container x={960} y={210}>
			<ActorControls direction="vertical" />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<BonusSpinButton>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupBonusActiveStory}>
		<Container x={240} y={180}>
			<BonusSpinButton sizes={BONUS_SPIN_BUTTON_SIZES} />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<SpinButton>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={resetSlot3x3StoryState}>
		<Container x={240} y={180}>
			<SpinButton anchor={0.5} />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<GameInterface>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={setupMoneyStory}>
		<GameInterface />
	</Slot3x3StoryFrame>
</Story>

<Story name="<ReelSpeedSetting>" play={expectReelSpeedSetting}>
	<Slot3x3StoryFrame pixi={false} init={resetSlot3x3StoryState}>
		<section class="html-panel compact">
			<ReelSpeedSetting />
		</section>
	</Slot3x3StoryFrame>
</Story>

<Story name="<ModalSettings>" play={expectSettingsModal}>
	<Slot3x3StoryFrame pixi={false} init={setupSettingsModalStory}>
		<ModalSettings />
	</Slot3x3StoryFrame>
</Story>

<Story name="<Modals>" play={expectBetMenuModal}>
	<Slot3x3StoryFrame pixi={false} init={setupBetMenuModalStory}>
		<Modals>
			{#snippet version()}
				<span>Slot 3x3 Storybook 0.0.0</span>
			{/snippet}
		</Modals>
	</Slot3x3StoryFrame>
</Story>

<Story name="<EnableGameActor>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={resetSlot3x3StoryState}>
		<EnableGameActor debug />
		<Container x={60} y={70}>
			<Text
				text="Game actor mounted in debug mode"
				style={{
					fontFamily: 'proxima-nova',
					fontSize: 24,
					fontWeight: '700',
					fill: 0xffffff,
				}}
			/>
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<EnableSound>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={resetSlot3x3StoryState}>
		<EnableSound />
		<Container x={80} y={80}>
			<Text
				text="EnableSound mounted with the loaded audio atlas"
				style={{
					fontFamily: 'proxima-nova',
					fontSize: 24,
					fontWeight: '700',
					fill: 0xffffff,
				}}
			/>
			<Rectangle y={48} width={460} height={4} backgroundColor={0x14b8a6} backgroundAlpha={0.92} />
		</Container>
	</Slot3x3StoryFrame>
</Story>

<Story name="<Sound>" play={expectPixiCanvas}>
	<Slot3x3StoryFrame init={resetSlot3x3StoryState}>
		<Slot3x3SoundHarness />
	</Slot3x3StoryFrame>
</Story>

<style lang="scss">
	.html-panel {
		position: absolute;
		top: 48px;
		left: 48px;
		box-sizing: border-box;
		width: min(520px, calc(100vw - 96px));
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		background: rgba(10, 12, 18, 0.94);
		box-shadow: 0 16px 60px rgba(0, 0, 0, 0.35);
		color: #ffffff;
		padding: 24px;
	}

	.compact {
		width: min(420px, calc(100vw - 96px));
	}
</style>
