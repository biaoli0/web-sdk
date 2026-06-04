import { expect, fireEvent, waitFor, within } from 'storybook/test';

type StoryPlayContext = {
	canvas: ReturnType<typeof within>;
	canvasElement: HTMLElement;
};

const assertPreviewFrame = async ({ canvasElement }: StoryPlayContext) => {
	await waitFor(async () => {
		await expect(canvasElement.querySelector('.preview')).toBeInTheDocument();
	});
};

export const expectPixiCanvas = async (context: StoryPlayContext) => {
	await assertPreviewFrame(context);

	await waitFor(async () => {
		await expect(context.canvasElement.querySelector('canvas')).toBeInTheDocument();
	});

	const pixiCanvas = context.canvasElement.querySelector('canvas');

	if (!(pixiCanvas instanceof HTMLCanvasElement)) {
		throw new Error('Expected Storybook story to render a Pixi canvas.');
	}

	await expect(pixiCanvas).toBeVisible();
	await expect(pixiCanvas.width).toBeGreaterThan(0);
	await expect(pixiCanvas.height).toBeGreaterThan(0);
};

export const expectReelSpeedSetting = async (context: StoryPlayContext) => {
	await assertPreviewFrame(context);

	const reelSpeedInput = context.canvas.getByLabelText('Reel Speed') as HTMLInputElement;

	await expect(reelSpeedInput).toBeVisible();
	await expect(reelSpeedInput).toBeEnabled();

	await fireEvent.input(reelSpeedInput, { target: { value: '0.35' } });

	await waitFor(async () => {
		await expect(reelSpeedInput.value).toBe('0.35');
	});
};

export const expectSettingsModal = async (context: StoryPlayContext) => {
	await assertPreviewFrame(context);

	await expect(context.canvas.getByText('SETTINGS')).toBeVisible();
	await expect(context.canvas.getByText('MASTER VOLUME')).toBeVisible();
	await expect(context.canvas.getByLabelText('Reel Speed')).toBeVisible();
};

export const expectBetMenuModal = async (context: StoryPlayContext) => {
	await assertPreviewFrame(context);

	await expect(context.canvas.getByText('BET MENU')).toBeVisible();
	await expect(context.canvas.getByText('SELECT YOUR BET')).toBeVisible();
	await expect(context.canvas.getByText('CONFIRM')).toBeVisible();
};
