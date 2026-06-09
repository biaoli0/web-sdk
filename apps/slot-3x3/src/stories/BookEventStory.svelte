<script lang="ts">
	import { StoryGameTemplate, StoryLocale } from 'components-storybook';

	import Game from '../components/Game.svelte';

	type Props = {
		action: () => Promise<void>;
		skipLoadingScreen?: boolean;
	};

	const { action, skipLoadingScreen = true }: Props = $props();
</script>

<StoryGameTemplate {skipLoadingScreen} {action}>
	<StoryLocale lang="en">
		<Game />
	</StoryLocale>
</StoryGameTemplate>
