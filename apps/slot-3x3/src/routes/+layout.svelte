<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount, type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate, LoaderStakeEngine, LoaderExample, LoadI18n } from 'components-shared';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	let showYourLoader = $state(false);
	let canAuthenticate = $state(!dev);

	const loaderUrlStakeEngine = new URL('../../stake-engine-loader.gif', import.meta.url).href;
	const loaderUrl = new URL('../../loader.gif', import.meta.url).href;

	setContext();

	onMount(() => {
		if (!dev) return;

		const url = new URL(window.location.href);
		let changed = false;

		if (!url.searchParams.has('rgs_url')) {
			url.searchParams.set('rgs_url', 'http://localhost:3100');
			changed = true;
		}

		if (!url.searchParams.has('sessionID')) {
			url.searchParams.set('sessionID', 'slot-3x3-local');
			changed = true;
		}

		if (changed) {
			window.location.replace(url.toString());
			return;
		}

		canAuthenticate = true;
	});
</script>

{#if canAuthenticate}
	<GlobalStyle>
		<Authenticate>
			<LoadI18n {messagesMap}>
				<Game />
			</LoadI18n>
		</Authenticate>
	</GlobalStyle>
{/if}

<LoaderStakeEngine src={loaderUrlStakeEngine} oncomplete={() => (showYourLoader = true)} />

{#if showYourLoader}
	<LoaderExample src={loaderUrl} />
{/if}

{@render props.children()}
