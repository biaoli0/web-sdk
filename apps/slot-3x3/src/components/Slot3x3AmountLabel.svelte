<script lang="ts">
	import { Tween } from 'svelte/motion';

	import { UiLabel, i18nDerived } from 'components-ui-pixi';
	import { stateBet, stateBetDerived } from 'state-shared';
	import { bookEventAmountToCurrencyString, numberToCurrencyString } from 'utils-shared/amount';

	type AmountKind = 'win' | 'bet' | 'balance';

	type Props = {
		kind: AmountKind;
		stacked?: boolean;
	};

	const props: Props = $props();
	const balanceTween = new Tween(stateBet.balanceAmount);
	const winBookEventAmountTween = new Tween(stateBet.winBookEventAmount);

	const label = $derived.by(() => {
		if (props.kind === 'win') return i18nDerived.win();
		if (props.kind === 'balance') return i18nDerived.balance();
		return stateBetDerived.activeBetMode()?.text.betAmountLabel || i18nDerived.bet();
	});

	const value = $derived.by(() => {
		if (props.kind === 'win') {
			return bookEventAmountToCurrencyString(winBookEventAmountTween.current);
		}

		if (props.kind === 'balance') {
			return numberToCurrencyString(balanceTween.current);
		}

		return numberToCurrencyString(stateBetDerived.betCost());
	});

	$effect(() => {
		balanceTween.set(stateBet.balanceAmount);
	});

	$effect(() => {
		winBookEventAmountTween.set(stateBet.winBookEventAmount);
	});
</script>

<UiLabel tiled {label} {value} stacked={props.stacked} />
