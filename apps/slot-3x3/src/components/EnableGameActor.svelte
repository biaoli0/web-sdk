<script lang="ts">
	import { onMount } from 'svelte';

	import { Text } from 'pixi-svelte';

	import { bonusFlowActor } from '../game/actors/bonusFlowActor';
	import { ACTOR_EVENT_BONUS_SPIN, gameActor, sendGameActorEvent } from '../game/actors/gameActor';
	import { getContext } from '../game/context';
	import { EVENT_BONUS_SPIN } from '../game/typesEmitterEvent';

	type Props = {
		debug?: boolean;
	};

	const props: Props = $props();
	const context = getContext();

	onMount(() => {
		const { unsubscribe } = gameActor.subscribe((snapshot) => {
			context.stateXstate.value = snapshot.value;
		});

		bonusFlowActor.start();
		gameActor.start();
		gameActor.send({ type: 'RENDERED' });

		return () => {
			unsubscribe();
			gameActor.stop();
			bonusFlowActor.stop();
		};
	});

	context.eventEmitter.subscribeOnMount({
		bet: () => gameActor.send({ type: 'BET' }),
		autoBet: () => gameActor.send({ type: 'AUTO_BET' }),
		resumeBet: () => gameActor.send({ type: 'RESUME_BET' }),
		[EVENT_BONUS_SPIN]: () => sendGameActorEvent({ type: ACTOR_EVENT_BONUS_SPIN }),
	});
</script>

{#if props.debug}
	<Text
		x={context.stateLayoutDerived.canvasSizes().width}
		anchor={{ x: 1, y: 0 }}
		style={{ fill: 0xffffff }}
		text={JSON.stringify(context.stateXstate.value, undefined, 2)}
	/>
{/if}
