<script lang="ts">
	import { Tween } from 'svelte/motion';

	import { UiLabel, i18nDerived } from 'components-ui-pixi';
	import { stateBet, stateBetDerived } from 'state-shared';
	import { bookEventAmountToCurrencyString, numberToCurrencyString } from 'utils-shared/amount';

	import { stateGame } from '../game/stateGame.svelte';

	type AmountKind = 'win' | 'bet' | 'balance';

	type Props = {
		kind: AmountKind;
		stacked?: boolean;
	};

	const props: Props = $props();
	const balanceTween = new Tween(stateBet.balanceAmount);
	const winBookEventAmountTween = new Tween(stateBet.winBookEventAmount);
	const bonusWinAmountTween = new Tween(stateGame.bonus.totalWin);

	const label = $derived.by(() => {
		if (props.kind === 'win') return i18nDerived.win();
		if (props.kind === 'balance') return i18nDerived.balance();
		return stateBetDerived.activeBetMode()?.text.betAmountLabel || i18nDerived.bet();
	});

	const value = $derived.by(() => {
		if (props.kind === 'win') {
			if (stateGame.bonus.status !== 'inactive') {
				return numberToCurrencyString(bonusWinAmountTween.current);
			}

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

	$effect(() => {
		bonusWinAmountTween.set(stateGame.bonus.totalWin);
	});
</script>

<UiLabel tiled {label} {value} stacked={props.stacked} />
