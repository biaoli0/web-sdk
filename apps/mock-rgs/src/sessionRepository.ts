import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SESSION_STORE_VERSION = 1;

export type SessionRecord = {
	sessionID: string;
};

type PersistedSessions<TSession extends SessionRecord> = {
	version: typeof SESSION_STORE_VERSION;
	sessions: TSession[];
};

export const defaultSessionStorePath = () =>
	process.env.MOCK_RGS_SESSION_STORE_PATH ??
	fileURLToPath(new URL('../.data/sessions.json', import.meta.url));

export class SessionRepository<TSession extends SessionRecord> {
	private readonly filePath: string;
	private readonly sessions: Map<string, TSession>;

	constructor({ filePath }: { filePath: string }) {
		this.filePath = filePath;
		this.sessions = this.load();
	}

	get(sessionID: string) {
		return this.sessions.get(sessionID);
	}

	set(session: TSession) {
		this.sessions.set(session.sessionID, session);
		this.persist();
		return session;
	}

	getOrCreate(sessionID: string, createSession: () => TSession) {
		const existingSession = this.get(sessionID);
		if (existingSession) return existingSession;

		return this.set(createSession());
	}

	persist() {
		this.save();
	}

	private load() {
		if (!existsSync(this.filePath)) return new Map<string, TSession>();

		try {
			const persisted = JSON.parse(readFileSync(this.filePath, 'utf8')) as PersistedSessions<TSession>;
			if (persisted.version !== SESSION_STORE_VERSION || !Array.isArray(persisted.sessions)) {
				throw new Error('Unsupported mock-rgs session store format.');
			}

			return new Map(persisted.sessions.map((session) => [session.sessionID, session] as const));
		} catch (error) {
			console.warn(`Unable to load mock-rgs sessions from ${this.filePath}.`, error);
			return new Map<string, TSession>();
		}
	}

	private save() {
		const directory = dirname(this.filePath);
		const temporaryFilePath = `${this.filePath}.${process.pid}.tmp`;
		const persisted: PersistedSessions<TSession> = {
			version: SESSION_STORE_VERSION,
			sessions: [...this.sessions.values()],
		};

		mkdirSync(directory, { recursive: true });

		try {
			writeFileSync(temporaryFilePath, `${JSON.stringify(persisted, null, 2)}\n`, 'utf8');
			renameSync(temporaryFilePath, this.filePath);
		} catch (error) {
			rmSync(temporaryFilePath, { force: true });
			throw error;
		}
	}
}
