<script lang="ts">
	import { Container, Text } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { EnableSpaceHold } from 'components-shared';

	import { BOARD_SIZES } from '../game/constants';
	import { getContext } from '../game/context';
	import ActorControls from './ActorControls.svelte';
	import OverallBetInfo from './OverallBetInfo.svelte';

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
	const SWITCH_BET_ICON_SIZE = 150;
	const ACTION_SCALE_RIGHT_RAIL = {
		side: 0.6,
		action: 0.78,
		switchBet: 0.6,
	};
	const ACTION_SCALE_BOTTOM_ROW = {
		side: 0.48,
		action: 0.62,
		switchBet: 0.48,
	};

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
	const actionPanelX = $derived(useRightRail ? rightRailX : gameLayout.width * 0.5);
	const actionPanelY = $derived(useRightRail ? rightRailY : portraitActionPanelY);
	const actionDirection = $derived(useRightRail ? 'vertical' : 'horizontal');
	const actionScales = $derived(useRightRail ? ACTION_SCALE_RIGHT_RAIL : ACTION_SCALE_BOTTOM_ROW);
	const amountPanelYTarget = $derived(useRightRail ? amountPanelY : portraitAmountPanelY);
	const amountPanelGap = $derived(useRightRail ? 300 : 220);
	const amountPanelScale = $derived(useRightRail ? 0.78 : 0.68);
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
	<Container x={actionPanelX} y={actionPanelY} scale={uiScale}>
		<ActorControls
			direction={actionDirection}
			gap={ACTION_BUTTON_GAP}
			sideScale={actionScales.side}
			actionScale={actionScales.action}
			switchBetScale={actionScales.switchBet}
			switchBetIconSize={SWITCH_BET_ICON_SIZE}
		/>
	</Container>
</MainContainer>

<MainContainer standard>
	<Container x={layout.width * 0.5} y={amountPanelYTarget}>
		<OverallBetInfo gap={amountPanelGap} itemScale={amountPanelScale} />
	</Container>
</MainContainer>
