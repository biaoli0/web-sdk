<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiAtlasFramePreview from './UiAtlasFramePreview.svelte';

	const { Story } = defineMeta({
		title: 'COMPONENTS/<UiAtlasFramePreview>',
		component: UiAtlasFramePreview,
		args: {
			frameName: 'soundButtonMuted',
			imageSrc: '/assets/sprites/ui/ui.png',
			imageWidth: 1046,
			imageHeight: 1046,
			frameX: 308,
			frameY: 482,
			frameW: 135,
			frameH: 135,
			rotated: true,
			trimmed: false,
			pivotX: 0.5,
			pivotY: 0.5,
			atlasScale: 0.55,
			imageBackground: '#111827',
		},
		argTypes: {
			frameName: { control: 'text' },
			imageSrc: { control: 'text' },
			imageWidth: { control: { type: 'number', min: 1, step: 1 } },
			imageHeight: { control: { type: 'number', min: 1, step: 1 } },
			frameX: { control: { type: 'number', min: 0, step: 1 } },
			frameY: { control: { type: 'number', min: 0, step: 1 } },
			frameW: { control: { type: 'number', min: 1, step: 1 } },
			frameH: { control: { type: 'number', min: 1, step: 1 } },
			rotated: { control: 'boolean' },
			trimmed: { control: 'boolean' },
			pivotX: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
			pivotY: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
			atlasScale: { control: { type: 'number', min: 0.1, max: 1, step: 0.05 } },
			imageBackground: { control: 'color' },
		},
	});
</script>

<Story name="Icon frame crop">
	{#snippet template(args)}
		<UiAtlasFramePreview {...args} />
	{/snippet}
</Story>
