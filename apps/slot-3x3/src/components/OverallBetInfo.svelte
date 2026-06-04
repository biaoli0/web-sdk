<script lang="ts">
	import { Container } from 'pixi-svelte';

	import MoneyMeter from './MoneyMeter.svelte';

	type Props = {
		gap: number;
		itemScale: number;
	};

	const props: Props = $props();
</script>

<Container x={-props.gap} scale={props.itemScale}>
	<MoneyMeter kind="win" stacked />
</Container>

<Container scale={props.itemScale}>
	<MoneyMeter kind="bet" stacked />
</Container>

<Container x={props.gap} scale={props.itemScale}>
	<MoneyMeter kind="balance" stacked />
</Container>
