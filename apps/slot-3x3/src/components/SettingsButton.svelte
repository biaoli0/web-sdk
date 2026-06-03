<script lang="ts">
	import { Container, Sprite } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { getContext } from '../game/context';

	const ICON_SIZE = 120;
	const context = getContext();

	const openSettings = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'settings' };
	};
</script>

<Container eventMode="static" cursor="pointer" onpointerup={openSettings}>
	<Sprite key="settingsMenu" anchor={0.5} width={ICON_SIZE} height={ICON_SIZE} />
</Container>
