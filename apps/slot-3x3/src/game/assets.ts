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
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
