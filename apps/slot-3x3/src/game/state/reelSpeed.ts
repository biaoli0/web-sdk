import { SPIN_OPTIONS_DEFAULT, SPIN_OPTIONS_FAST } from '../constants';

export type ReelSpeedState = {
	reelSpeed: number;
	reelSpeedBeforeTurbo: number;
};

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const clampReelSpeed = (value: number) => Math.min(1, Math.max(0, value));

export const createReelSpeedController = (getState: () => ReelSpeedState) => {
	const isTurbo = () => clampReelSpeed(getState().reelSpeed) >= 1;

	const setReelSpeed = (value: number | string) => {
		const state = getState();
		const parsedValue = Number(value);
		const reelSpeed = clampReelSpeed(Number.isFinite(parsedValue) ? parsedValue : 0);
		const turbo = reelSpeed >= 1;

		state.reelSpeed = reelSpeed;

		if (!turbo) {
			state.reelSpeedBeforeTurbo = reelSpeed;
		}
	};

	const setTurbo = (value: boolean) => {
		const state = getState();

		if (value) {
			if (!isTurbo()) {
				state.reelSpeedBeforeTurbo = clampReelSpeed(state.reelSpeed);
			}

			state.reelSpeed = 1;
			return;
		}

		state.reelSpeed = clampReelSpeed(state.reelSpeedBeforeTurbo);
	};

	const toggleTurbo = () => setTurbo(!isTurbo());

	const normalSpinOptions = () => {
		const reelSpeed = clampReelSpeed(getState().reelSpeed);

		return {
			...SPIN_OPTIONS_DEFAULT,
			reelPreSpinSpeed: lerp(
				SPIN_OPTIONS_DEFAULT.reelPreSpinSpeed,
				SPIN_OPTIONS_FAST.reelPreSpinSpeed,
				reelSpeed,
			),
			reelSpinSpeed: lerp(
				SPIN_OPTIONS_DEFAULT.reelSpinSpeed,
				SPIN_OPTIONS_FAST.reelSpinSpeed,
				reelSpeed,
			),
			reelBounceSizeMulti: lerp(
				SPIN_OPTIONS_DEFAULT.reelBounceSizeMulti,
				SPIN_OPTIONS_FAST.reelBounceSizeMulti,
				reelSpeed,
			),
			reelSpinDelay: lerp(
				SPIN_OPTIONS_DEFAULT.reelSpinDelay,
				SPIN_OPTIONS_FAST.reelSpinDelay,
				reelSpeed,
			),
		};
	};

	return {
		isTurbo,
		setReelSpeed,
		setTurbo,
		toggleTurbo,
		normalSpinOptions,
	};
};
