<script lang="ts">
	import { Container } from 'pixi-svelte';

	import AutoSpinButton from './AutoSpinButton.svelte';
	import BetMenuButton from './BetMenuButton.svelte';
	import SettingsButton from './SettingsButton.svelte';
	import SoundButton from './SoundButton.svelte';
	import SpinButton from './SpinButton.svelte';

	type Direction = 'horizontal' | 'vertical';
	type ControlScales = {
		side: number;
		action: number;
		switchBet: number;
	};

	type Props = {
		direction: Direction;
	};

	const CONTROL_GAP = 120;
	const CONTROL_SCALES_BY_DIRECTION = {
		horizontal: {
			side: 0.48,
			action: 0.62,
			switchBet: 0.48,
		},
		vertical: {
			side: 0.6,
			action: 0.78,
			switchBet: 0.6,
		},
	} satisfies Record<Direction, ControlScales>;

	const props: Props = $props();
	const controlScales = $derived(CONTROL_SCALES_BY_DIRECTION[props.direction]);
	const controlPosition = (index: number) =>
		props.direction === 'vertical'
			? { x: 0, y: index * CONTROL_GAP }
			: { x: index * CONTROL_GAP, y: 0 };
</script>

<Container {...controlPosition(-3)} scale={controlScales.side}>
	<SoundButton />
</Container>

<Container {...controlPosition(-2)} scale={controlScales.action}>
	<AutoSpinButton />
</Container>

<Container {...controlPosition(-0.5)} scale={controlScales.action * 2}>
	<SpinButton anchor={0.5} />
</Container>

<Container {...controlPosition(1)} scale={controlScales.switchBet}>
	<BetMenuButton />
</Container>

<Container {...controlPosition(2)} scale={controlScales.side}>
	<SettingsButton />
</Container>
