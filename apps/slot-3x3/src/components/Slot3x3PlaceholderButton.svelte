<script lang="ts">
	import { Button, type ButtonProps } from 'components-pixi';
	import { Rectangle, Text } from 'pixi-svelte';

	type Props = Partial<Omit<ButtonProps, 'children' | 'onpress' | 'sizes'>> & {
		label: string;
		sizes?: ButtonProps['sizes'];
	};

	const {
		label,
		sizes = { width: 132, height: 76 },
		disabled = false,
		...buttonProps
	}: Props = $props();

	const onpress = () => {};
</script>

<Button {...buttonProps} {sizes} {disabled} {onpress}>
	{#snippet children({ center, hovered, pressed })}
		<Rectangle
			width={sizes.width}
			height={sizes.height}
			anchor={0.5}
			x={center.x}
			y={center.y}
			borderRadius={8}
			backgroundColor={pressed ? 0xf3f4f6 : hovered ? 0xffffff : 0x111827}
			backgroundAlpha={pressed || hovered ? 0.95 : 0.88}
			borderColor={pressed || hovered ? 0x111827 : 0xffffff}
			borderWidth={2}
			borderAlpha={0.9}
		/>
		<Text
			{...center}
			anchor={0.5}
			text={label}
			style={{
				align: 'center',
				fontFamily: 'proxima-nova',
				fontSize: 24,
				fontWeight: '700',
				fill: pressed || hovered ? 0x111827 : 0xffffff,
				wordWrap: true,
				wordWrapWidth: sizes.width - 18,
			}}
		/>
	{/snippet}
</Button>
