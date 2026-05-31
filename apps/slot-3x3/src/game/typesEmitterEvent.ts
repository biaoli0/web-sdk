import type { EmitterEventSound } from '../components/Sound.svelte';

export const EVENT_BONUS_SPIN = 'bonusSpin' as const;

export type EmitterEventGame = EmitterEventSound | { type: typeof EVENT_BONUS_SPIN };
