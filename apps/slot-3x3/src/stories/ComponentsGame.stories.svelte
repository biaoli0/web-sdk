<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'COMPONENTS/<Game>',
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { LoadI18n } from 'components-shared';
	import { GlobalStyle } from 'components-ui-html';
	import { stateBet, stateModal } from 'state-shared';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { stateGameDerived } from '../game/stateGame.svelte';
	import messagesMap from '../i18n/messagesMap';

	const resetSession = () => {
		stateModal.modal = null;
		stateGameDerived.clear();
		stateBet.balanceAmount = 10000;
		stateBet.betAmount = 1;
		stateBet.activeBetModeKey = 'BASE';
		stateBet.autoSpinsCounter = 0;
		stateBet.winBookEventAmount = 0;
	};

	setContext();

	onMount(() => {
		resetSession();

		return () => {
			stateModal.modal = null;
		};
	});
</script>

<Story name="ui modal session">
	<GlobalStyle>
		<LoadI18n {messagesMap}>
			<Game />

			<div class="session-controls">
				<button type="button" onclick={() => (stateModal.modal = { name: 'autoSpin' })}>
					Open Auto Spin
				</button>
				<button type="button" onclick={() => (stateModal.modal = { name: 'betAmountMenu' })}>
					Open Bet Menu
				</button>
				<button type="button" onclick={() => (stateModal.modal = { name: 'settings' })}>
					Open Sound Settings
				</button>
				<button type="button" onclick={() => (stateModal.modal = null)}>Close Modal</button>
				<button type="button" onclick={resetSession}>Reset Session</button>
			</div>
		</LoadI18n>
	</GlobalStyle>
</Story>

<style lang="scss">
	.session-controls {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 6px;
		background: rgba(0, 0, 0, 0.78);
		font-family: sans-serif;
	}

	button {
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.42);
		border-radius: 4px;
		background: #14532d;
		color: white;
		font-size: 13px;
		font-weight: 700;
		line-height: 1;
		padding: 8px 10px;
	}
</style>
