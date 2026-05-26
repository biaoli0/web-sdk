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
const DEFAULT_BOOK_FILES = {
	BASE: 'base.json',
	BONUS: 'bonus.json',
} as const;

const BOOK_FILES_BY_SESSION_ID = {
	'slot-3x3-local': {
		BASE: 'slot-3x3/base.json',
		BONUS: 'slot-3x3/base.json',
	},
} as const;

function readBooks(fileName: string) {
	return JSON.parse(readFileSync(join(booksDirectory, fileName), 'utf8')) as RawBook[];
}

function loadBooksByMode(bookFiles: Record<string, string>) {
	const missingFiles = Object.values(bookFiles).filter(
		(fileName) => !existsSync(join(booksDirectory, fileName)),
	);

	if (missingFiles.length > 0) {
		throw new Error(
			`Missing book file(s): ${missingFiles.join(', ')}.`,
		);
	}

	return {
		BASE: readBooks(bookFiles.BASE),
		BONUS: readBooks(bookFiles.BONUS),
	};
}

const defaultBooksByMode = loadBooksByMode(DEFAULT_BOOK_FILES);
const booksBySessionID = Object.fromEntries(
	Object.entries(BOOK_FILES_BY_SESSION_ID).map(([sessionID, bookFiles]) => [
		sessionID,
		loadBooksByMode(bookFiles),
	]),
) as Record<string, typeof defaultBooksByMode>;

export type BookMode = keyof typeof defaultBooksByMode;

export function getBookMode(mode: string): BookMode {
	return mode.toUpperCase() === 'BONUS' ? 'BONUS' : 'BASE';
}

export function getBooks(mode: string, options?: { sessionID?: string }) {
	const booksByMode = options?.sessionID ? booksBySessionID[options.sessionID] : undefined;

	return (booksByMode ?? defaultBooksByMode)[getBookMode(mode)];
}
