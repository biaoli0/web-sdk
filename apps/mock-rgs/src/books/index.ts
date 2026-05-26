import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type RawBookEvent = {
	index: number;
	type: string;
	[key: string]: unknown;
};

export type RawBook = {
	id?: number;
	payoutMultiplier?: number;
	events?: RawBookEvent[];
	[key: string]: unknown;
};

const booksDirectory = dirname(fileURLToPath(import.meta.url));
const BOOK_FILES = {
	BASE: 'base.json',
	BONUS: 'bonus.json',
} as const;

function readBooks(fileName: string) {
	return JSON.parse(readFileSync(join(booksDirectory, fileName), 'utf8')) as RawBook[];
}

function loadBooksByMode() {
	const missingFiles = Object.values(BOOK_FILES).filter(
		(fileName) => !existsSync(join(booksDirectory, fileName)),
	);

	if (missingFiles.length > 0) {
		throw new Error(
			`Missing book file(s): ${missingFiles.join(', ')}.`,
		);
	}

	return {
		BASE: readBooks(BOOK_FILES.BASE),
		BONUS: readBooks(BOOK_FILES.BONUS),
	};
}

const booksByMode = loadBooksByMode();

export type BookMode = keyof typeof booksByMode;

export function getBookMode(mode: string): BookMode {
	return mode.toUpperCase() === 'BONUS' ? 'BONUS' : 'BASE';
}

export function getBooks(mode: string) {
	return booksByMode[getBookMode(mode)];
}
