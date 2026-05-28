<script lang="ts">
	import { Container, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { EnableSpaceHold } from 'components-shared';
	import {
		ButtonAutoSpin,
		ButtonBet,
		ButtonSettings,
		ButtonSoundSwitch,
		LabelBet,
	} from 'components-ui-pixi';

	import { BOARD_SIZES } from '../game/constants';
	import { getContext } from '../game/context';
	import Slot3x3AmountLabel from './Slot3x3AmountLabel.svelte';

	const context = getContext();
	const BOARD_OFFSET_Y = -28;
	const BOARD_FRAME_RIGHT = 22;
	const BOARD_FRAME_BOTTOM = 52;
	const RAIL_RIGHT_MARGIN = 110;
	const RAIL_BOARD_GAP = 104;
	const RAIL_CENTER_FROM_BOARD_BOTTOM = 255;
	const AMOUNT_PANEL_BOTTOM_MARGIN = 118;
	const AMOUNT_PANEL_BOARD_GAP = 75;
	const PORTRAIT_ACTION_BOTTOM_MARGIN = 170;
	const PORTRAIT_ACTION_BOARD_GAP = 190;
	const ACTION_TO_AMOUNT_GAP = 92;
	const ACTION_BUTTON_GAP = 120;

	const gameLayout = $derived(context.stateLayoutDerived.mainLayout());
	const layout = $derived(context.stateLayoutDerived.mainLayoutStandard());
	const layoutType = $derived(context.stateLayoutDerived.layoutType());
	const useRightRail = $derived(layoutType !== 'portrait');
	const uiScale = $derived(layout.scale / gameLayout.scale);
	const boardRightX = $derived((gameLayout.width + BOARD_SIZES.width) * 0.5 + BOARD_FRAME_RIGHT);
	const boardBottomY = $derived(
		(gameLayout.height + BOARD_SIZES.height) * 0.5 + BOARD_OFFSET_Y + BOARD_FRAME_BOTTOM,
	);
	const boardBottomYStandard = $derived(
		layout.height * 0.5 + (boardBottomY - gameLayout.height * 0.5) / uiScale,
	);
	const rightRailX = $derived(
		Math.min(
			gameLayout.width - RAIL_RIGHT_MARGIN * uiScale,
			boardRightX + RAIL_BOARD_GAP * uiScale,
		),
	);
	const rightRailY = $derived(boardBottomY - RAIL_CENTER_FROM_BOARD_BOTTOM * uiScale);
	const amountPanelY = $derived(
		Math.min(
			layout.height - AMOUNT_PANEL_BOTTOM_MARGIN,
			boardBottomYStandard + AMOUNT_PANEL_BOARD_GAP,
		),
	);
	const portraitActionPanelY = $derived(
		Math.min(
			gameLayout.height - PORTRAIT_ACTION_BOTTOM_MARGIN * uiScale,
			boardBottomY + PORTRAIT_ACTION_BOARD_GAP * uiScale,
		),
	);
	const portraitActionPanelYStandard = $derived(
		Math.min(
			layout.height - PORTRAIT_ACTION_BOTTOM_MARGIN,
			boardBottomYStandard + PORTRAIT_ACTION_BOARD_GAP,
		),
	);
	const portraitAmountPanelY = $derived(portraitActionPanelYStandard + ACTION_TO_AMOUNT_GAP);
</script>

<EnableSpaceHold />

<Container x={20} y={20}>
	<Text
		text="3X3 SLOT"
		style={{
			fontFamily: 'proxima-nova',
			fontSize: 24,
			fontWeight: '700',
			fill: 0xffffff,
		}}
	/>
</Container>

<MainContainer>
	{#if useRightRail}
		<Container x={rightRailX} y={rightRailY} scale={uiScale}>
			<Container y={-ACTION_BUTTON_GAP * 2} scale={0.6}>
				<ButtonSoundSwitch anchor={0.5} />
			</Container>

			<Container y={-ACTION_BUTTON_GAP} scale={0.78}>
				<ButtonAutoSpin anchor={0.5} />
			</Container>

			<Container scale={0.78}>
				<ButtonBet anchor={0.5} />
			</Container>

			<Container y={ACTION_BUTTON_GAP} scale={0.32}>
				<LabelBet stacked />
			</Container>

			<Container y={ACTION_BUTTON_GAP * 2} scale={0.6}>
				<ButtonSettings anchor={0.5} />
			</Container>
		</Container>
	{:else}
		<Container x={gameLayout.width * 0.5} y={portraitActionPanelY} scale={uiScale}>
			<Container x={-ACTION_BUTTON_GAP * 2} scale={0.48}>
				<ButtonSoundSwitch anchor={0.5} />
			</Container>

			<Container x={-ACTION_BUTTON_GAP} scale={0.62}>
				<ButtonAutoSpin anchor={0.5} />
			</Container>

			<Container scale={0.62}>
				<ButtonBet anchor={0.5} />
			</Container>

			<Container x={ACTION_BUTTON_GAP} scale={0.24}>
				<LabelBet stacked />
			</Container>

			<Container x={ACTION_BUTTON_GAP * 2} scale={0.48}>
				<ButtonSettings anchor={0.5} />
			</Container>
		</Container>
	{/if}
</MainContainer>

<MainContainer standard>
	{#if useRightRail}
		<Container x={layout.width * 0.5} y={amountPanelY}>
			<Container x={-300} scale={0.78}>
				<Slot3x3AmountLabel kind="win" stacked />
			</Container>

			<Container scale={0.78}>
				<Slot3x3AmountLabel kind="bet" stacked />
			</Container>

			<Container x={300} scale={0.78}>
				<Slot3x3AmountLabel kind="balance" stacked />
			</Container>
		</Container>
	{:else}
		<Container x={layout.width * 0.5} y={portraitAmountPanelY}>
			<Container x={-220} scale={0.68}>
				<Slot3x3AmountLabel kind="win" stacked />
			</Container>

			<Container scale={0.68}>
				<Slot3x3AmountLabel kind="bet" stacked />
			</Container>

			<Container x={220} scale={0.68}>
				<Slot3x3AmountLabel kind="balance" stacked />
			</Container>
		</Container>
	{/if}
</MainContainer>
