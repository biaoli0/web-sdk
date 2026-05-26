<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { Container } from 'pixi-svelte';
	import { i18nDerived, UiLabel } from 'components-ui-pixi';
	import { stateBet } from 'state-shared';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	const winAmount = new Tween(0);
 	const value = $derived(bookEventAmountToCurrencyString(winAmount.current));

	$effect(() => {
		winAmount.set(stateBet.winBookEventAmount);
	});
</script>

<Container y={-45}>
	<UiLabel {value} stacked />
</Container>
