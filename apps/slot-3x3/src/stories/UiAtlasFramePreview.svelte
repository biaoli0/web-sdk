<script lang="ts">
	type Props = {
		frameName: string;
		imageSrc: string;
		imageWidth: number;
		imageHeight: number;
		frameX: number;
		frameY: number;
		frameW: number;
		frameH: number;
		rotated: boolean;
		trimmed: boolean;
		pivotX: number;
		pivotY: number;
		atlasScale: number;
		imageBackground: string;
	};
	type DragMode = 'move' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
	type Frame = {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	type DragState = {
		mode: DragMode;
		pointerId: number;
		startClientX: number;
		startClientY: number;
		startFrame: Frame;
	};

	const props: Props = $props();
	const MIN_FRAME_SIZE = 1;

	let atlasElement: HTMLDivElement;
	let frame = $state<Frame>({
		x: props.frameX,
		y: props.frameY,
		w: props.frameW,
		h: props.frameH,
	});
	let drag = $state<DragState | null>(null);

	$effect(() => {
		frame = {
			x: props.frameX,
			y: props.frameY,
			w: props.frameW,
			h: props.frameH,
		};
	});

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const roundFrame = (next: Frame) => ({
		x: Math.round(next.x),
		y: Math.round(next.y),
		w: Math.round(next.w),
		h: Math.round(next.h),
	});
	const clampFrame = (next: Frame) => {
		const width = clamp(next.w, MIN_FRAME_SIZE, props.imageWidth);
		const height = clamp(next.h, MIN_FRAME_SIZE, props.imageHeight);

		return roundFrame({
			x: clamp(next.x, 0, props.imageWidth - width),
			y: clamp(next.y, 0, props.imageHeight - height),
			w: width,
			h: height,
		});
	};
	const resizeFrame = ({ mode, startFrame }: DragState, dx: number, dy: number) => {
		const next = { ...startFrame };

		if (mode === 'move') {
			return clampFrame({
				...next,
				x: startFrame.x + dx,
				y: startFrame.y + dy,
			});
		}

		if (mode.includes('e')) {
			const right = clamp(
				startFrame.x + startFrame.w + dx,
				startFrame.x + MIN_FRAME_SIZE,
				props.imageWidth,
			);
			next.w = right - startFrame.x;
		}

		if (mode.includes('s')) {
			const bottom = clamp(
				startFrame.y + startFrame.h + dy,
				startFrame.y + MIN_FRAME_SIZE,
				props.imageHeight,
			);
			next.h = bottom - startFrame.y;
		}

		if (mode.includes('w')) {
			const right = startFrame.x + startFrame.w;
			next.x = clamp(startFrame.x + dx, 0, right - MIN_FRAME_SIZE);
			next.w = right - next.x;
		}

		if (mode.includes('n')) {
			const bottom = startFrame.y + startFrame.h;
			next.y = clamp(startFrame.y + dy, 0, bottom - MIN_FRAME_SIZE);
			next.h = bottom - next.y;
		}

		return clampFrame(next);
	};
	const startDrag = (event: PointerEvent, mode: DragMode) => {
		event.preventDefault();
		event.stopPropagation();

		atlasElement.setPointerCapture(event.pointerId);
		drag = {
			mode,
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startFrame: { ...frame },
		};
	};
	const updateDrag = (event: PointerEvent) => {
		if (!drag || event.pointerId !== drag.pointerId) return;

		const dx = (event.clientX - drag.startClientX) / props.atlasScale;
		const dy = (event.clientY - drag.startClientY) / props.atlasScale;
		frame = resizeFrame(drag, dx, dy);
	};
	const endDrag = (event: PointerEvent) => {
		if (!drag || event.pointerId !== drag.pointerId) return;

		if (atlasElement.hasPointerCapture(event.pointerId)) {
			atlasElement.releasePointerCapture(event.pointerId);
		}
		drag = null;
	};

	const frameConfig = $derived({
		[props.frameName]: {
			frame: {
				x: frame.x,
				y: frame.y,
				w: frame.w,
				h: frame.h,
			},
			rotated: props.rotated,
			trimmed: props.trimmed,
			pivot: {
				x: props.pivotX,
				y: props.pivotY,
			},
		},
	});
	const atlasWidth = $derived(props.imageWidth * props.atlasScale);
	const atlasHeight = $derived(props.imageHeight * props.atlasScale);
	const cropStyle = $derived(
		[
			`width: ${frame.w}px`,
			`height: ${frame.h}px`,
			`background-image: url("${props.imageSrc}")`,
			`background-position: -${frame.x}px -${frame.y}px`,
			`background-size: ${props.imageWidth}px ${props.imageHeight}px`,
		].join('; '),
	);
	const renderedWidth = $derived(props.rotated ? frame.h : frame.w);
	const renderedHeight = $derived(props.rotated ? frame.w : frame.h);
	const renderedTransform = $derived(props.rotated ? 'rotate(-90deg)' : 'none');
	const configText = $derived(JSON.stringify(frameConfig, null, '\t'));
</script>

<div class="preview" style={`--image-background: ${props.imageBackground}`}>
	<section class="atlas-panel">
		<div
			class="atlas"
			bind:this={atlasElement}
			style={`width: ${atlasWidth}px; height: ${atlasHeight}px`}
			onpointermove={updateDrag}
			onpointerup={endDrag}
			onpointercancel={endDrag}
		>
			<img src={props.imageSrc} alt="" style={`width: ${atlasWidth}px; height: ${atlasHeight}px`} />
			<div
				class:dragging={drag?.mode === 'move'}
				class="frame-box"
				style={`
					left: ${frame.x * props.atlasScale}px;
					top: ${frame.y * props.atlasScale}px;
					width: ${frame.w * props.atlasScale}px;
					height: ${frame.h * props.atlasScale}px;
				`}
				onpointerdown={(event) => startDrag(event, 'move')}
			>
				<div
					class="handle handle-nw"
					class:active={drag?.mode === 'nw'}
					onpointerdown={(event) => startDrag(event, 'nw')}
				></div>
				<div
					class="handle handle-n"
					class:active={drag?.mode === 'n'}
					onpointerdown={(event) => startDrag(event, 'n')}
				></div>
				<div
					class="handle handle-ne"
					class:active={drag?.mode === 'ne'}
					onpointerdown={(event) => startDrag(event, 'ne')}
				></div>
				<div
					class="handle handle-e"
					class:active={drag?.mode === 'e'}
					onpointerdown={(event) => startDrag(event, 'e')}
				></div>
				<div
					class="handle handle-se"
					class:active={drag?.mode === 'se'}
					onpointerdown={(event) => startDrag(event, 'se')}
				></div>
				<div
					class="handle handle-s"
					class:active={drag?.mode === 's'}
					onpointerdown={(event) => startDrag(event, 's')}
				></div>
				<div
					class="handle handle-sw"
					class:active={drag?.mode === 'sw'}
					onpointerdown={(event) => startDrag(event, 'sw')}
				></div>
				<div
					class="handle handle-w"
					class:active={drag?.mode === 'w'}
					onpointerdown={(event) => startDrag(event, 'w')}
				></div>
			</div>
		</div>
	</section>

	<section class="detail-panel">
		<div class="crop-grid">
			<div>
				<h2>Raw Crop</h2>
				<div class="crop" style={cropStyle}></div>
			</div>
			<div>
				<h2>Rendered Crop</h2>
				<div
					class="rendered-frame"
					style={`width: ${renderedWidth}px; height: ${renderedHeight}px;`}
				>
					<div class="crop" style={`${cropStyle}; transform: ${renderedTransform}`}></div>
				</div>
			</div>
		</div>

		<h2>Frame Config</h2>
		<pre>{configText}</pre>
	</section>
</div>

<style lang="scss">
	.preview {
		box-sizing: border-box;
		min-height: 100vh;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 420px;
		gap: 16px;
		padding: 16px;
		background: transparent;
		color: #111827;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	.atlas-panel,
	.detail-panel {
		min-width: 0;
		overflow: auto;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 8px;
		background: transparent;
	}

	.atlas-panel {
		padding: 12px;
	}

	.detail-panel {
		padding: 16px;
	}

	.atlas {
		position: relative;
		background: var(--image-background);
		touch-action: none;
		user-select: none;
	}

	img {
		display: block;
	}

	.frame-box {
		position: absolute;
		box-sizing: border-box;
		border: 2px solid #22c55e;
		background: rgba(34, 197, 94, 0.18);
		box-shadow: 0 0 0 1px rgba(2, 6, 23, 0.9);
		cursor: move;
		touch-action: none;
	}

	.frame-box.dragging,
	.handle.active {
		border-color: #a3e635;
	}

	.handle {
		position: absolute;
		box-sizing: border-box;
		width: 12px;
		height: 12px;
		border: 2px solid #020617;
		border-radius: 999px;
		background: #22c55e;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.75);
		touch-action: none;
	}

	.handle-nw {
		left: -7px;
		top: -7px;
		cursor: nwse-resize;
	}

	.handle-n {
		left: 50%;
		top: -7px;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.handle-ne {
		right: -7px;
		top: -7px;
		cursor: nesw-resize;
	}

	.handle-e {
		right: -7px;
		top: 50%;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	.handle-se {
		right: -7px;
		bottom: -7px;
		cursor: nwse-resize;
	}

	.handle-s {
		left: 50%;
		bottom: -7px;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.handle-sw {
		left: -7px;
		bottom: -7px;
		cursor: nesw-resize;
	}

	.handle-w {
		left: -7px;
		top: 50%;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	.crop-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		align-items: start;
	}

	h2 {
		margin: 0 0 8px;
		font-size: 13px;
		font-weight: 700;
		line-height: 1.2;
		color: #334155;
	}

	.crop,
	.rendered-frame {
		background-color: var(--image-background);
		background-repeat: no-repeat;
	}

	.crop {
		transform-origin: center;
	}

	.rendered-frame {
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	pre {
		margin: 0;
		white-space: pre-wrap;
		border-radius: 6px;
		background: #0f172a;
		color: #e2e8f0;
		padding: 12px;
		font-size: 12px;
		line-height: 1.45;
	}

	@media (max-width: 900px) {
		.preview {
			grid-template-columns: 1fr;
		}
	}
</style>
