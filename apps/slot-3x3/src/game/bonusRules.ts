import { CENTRAL_REEL_INDEX } from './constants';

export const shouldHoldBonusRevealReel = (reelIndex: number) => reelIndex === CENTRAL_REEL_INDEX;
