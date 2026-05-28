<script lang="ts">
	import { Container, Sprite } from 'pixi-svelte';
	import {
		ButtonAutoSpin,
		ButtonBet,
		ButtonSettings,
		ButtonSoundSwitch,
	} from 'components-ui-pixi';
	import { stateModal } from 'state-shared';

	import { getContext } from '../game/context';

	type Direction = 'horizontal' | 'vertical';

	type Props = {
		direction: Direction;
		gap: number;
		sideScale: number;
		actionScale: number;
		switchBetScale: number;
		switchBetIconSize: number;
	};

	const props: Props = $props();
	const context = getContext();
	const betMenuDisabled = $derived(!context.stateXstateDerived.isIdle());
	const controlPosition = (index: number) =>
		props.direction === 'vertical' ? { y: index * props.gap } : { x: index * props.gap };

	const openBetMenu = () => {
		if (betMenuDisabled) return;

		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'betAmountMenu' };
	};
</script>

<Container {...controlPosition(-2)} scale={props.sideScale}>
	<ButtonSoundSwitch anchor={0.5} />
</Container>

<Container {...controlPosition(-1)} scale={props.actionScale}>
	<ButtonAutoSpin anchor={0.5} />
</Container>

<Container scale={props.actionScale}>
	<ButtonBet anchor={0.5} />
</Container>

<Container
	{...controlPosition(1)}
	scale={props.switchBetScale}
	eventMode="static"
	cursor={betMenuDisabled ? 'not-allowed' : 'pointer'}
	onpointerup={openBetMenu}
>
	<Sprite
		key="switchBet"
		anchor={0.5}
		width={props.switchBetIconSize}
		height={props.switchBetIconSize}
		alpha={betMenuDisabled ? 0.5 : 1}
	/>
</Container>

<Container {...controlPosition(2)} scale={props.sideScale}>
	<ButtonSettings anchor={0.5} />
</Container>
