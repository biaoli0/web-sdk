export default {
	symbolsStatic: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbolsStatic/newSymbolsStatic.json', import.meta.url).href,
		preload: true,
	},
	switchBet: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/switchBet.png', import.meta.url).href,
		preload: true,
	},
	autoPlay: {
		type: 'sprites',
		src: new URL('../../assets/sprites/ui/autoPlay.json', import.meta.url).href,
		preload: true,
	},
	uiIcons: {
		type: 'sprites',
		src: new URL('../../assets/sprites/ui/ui.json', import.meta.url).href,
		preload: true,
	},
	menuBackgroundLandscape: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/menuBackgroundLandscape.jpg', import.meta.url).href,
		preload: true,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
