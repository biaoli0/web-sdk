<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';

	import EnableSound from '../components/EnableSound.svelte';
	import Sound from '../components/Sound.svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	let soundStarted = $state(false);

	const startSound = () => {
		soundStarted = true;
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
	};
</script>

<EnableSound />

{#if soundStarted}
	<Sound />
{/if}

<Container x={80} y={80}>
	<Text
		text={soundStarted ? 'Sound event subscriber mounted' : 'Sound assets loaded'}
		style={{
			fontFamily: 'proxima-nova',
			fontSize: 24,
			fontWeight: '700',
			fill: 0xffffff,
		}}
	/>

	<Container y={58} eventMode="static" cursor="pointer" onpointerup={startSound}>
		<Rectangle
			width={240}
			height={64}
			borderRadius={8}
			backgroundColor={soundStarted ? 0x14532d : 0x0f766e}
			borderColor={0xffffff}
			borderAlpha={0.5}
			borderWidth={2}
		/>
		<Text
			x={120}
			y={32}
			anchor={0.5}
			text={soundStarted ? 'PLAY TEST SOUND' : 'MOUNT SOUND'}
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 18,
				fontWeight: '800',
				fill: 0xffffff,
			}}
		/>
	</Container>
</Container>
