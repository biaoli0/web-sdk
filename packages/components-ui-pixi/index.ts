import UI from './src/components/UI.svelte';
import UiGameName from './src/components/UiGameName.svelte';
import UiLabel from './src/components/UiLabel.svelte';
import ButtonAutoSpin from './src/components/ButtonAutoSpin.svelte';
import ButtonBet from './src/components/ButtonBet.svelte';
import ButtonSettings from './src/components/ButtonSettings.svelte';
import ButtonSoundSwitch from './src/components/ButtonSoundSwitch.svelte';
import LabelBet from './src/components/LabelBet.svelte';

import messagesMap from './src/i18n/messagesMap';
import { i18nDerived } from './src/i18n/i18nDerived';

export * from './src/types';

export {
	messagesMap,
	i18nDerived,
	UI,
	UiGameName,
	UiLabel,
	ButtonAutoSpin,
	ButtonBet,
	ButtonSettings,
	ButtonSoundSwitch,
	LabelBet,
};
