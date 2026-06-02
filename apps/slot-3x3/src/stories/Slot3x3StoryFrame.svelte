<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { LoadI18n } from 'components-shared';
	import { GlobalStyle } from 'components-ui-html';
	import { StoryPixiApp } from 'components-storybook';

	import assets from '../game/assets';
	import { setContext } from '../game/context';
	import messagesMap from '../i18n/messagesMap';
	import { resetSlot3x3StoryState } from './storyState';

	type Props = {
		children: Snippet;
		background?: string;
		init?: () => void;
		pixi?: boolean;
	};

	const {
		children,
		background = '#161a20',
		init = () => {},
		pixi = true,
	}: Props = $props();

	setContext();

	onMount(() => {
		resetSlot3x3StoryState();
		init();

		return resetSlot3x3StoryState;
	});
</script>

<GlobalStyle>
	<LoadI18n {messagesMap}>
		<div class="preview" style:background>
			{#if pixi}
				<StoryPixiApp {assets}>
					{@render children()}
				</StoryPixiApp>
			{:else}
				{@render children()}
			{/if}
		</div>
	</LoadI18n>
</GlobalStyle>

<style lang="scss">
	.preview {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		color: #ffffff;
		font-family: proxima-nova, sans-serif;
	}
</style>
