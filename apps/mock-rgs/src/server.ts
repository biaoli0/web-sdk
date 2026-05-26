import { pathToFileURL } from 'node:url';

import express, { type NextFunction, type Request, type Response } from 'express';

import { PORT } from './config';
import { authenticateSession, endRound, play, recordEvent } from './sessions';

export const app = express();

app.use((request: Request, response: Response, next: NextFunction) => {
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	response.header('Access-Control-Allow-Headers', 'Content-Type');

	if (request.method === 'OPTIONS') {
		response.sendStatus(204);
		return;
	}

	next();
});

app.use(express.json());

app.get('/health', (_request: Request, response: Response) => {
	response.json({ ok: true });
});

app.post('/wallet/authenticate', (request: Request, response: Response) => {
	const { sessionID, language } = request.body;
	response.json(authenticateSession({ sessionID, language }));
});

app.post('/wallet/play', (request: Request, response: Response) => {
	const { sessionID, amount, currency, mode } = request.body;
	response.json(play({ sessionID, amount, currency, mode }));
});

app.post('/wallet/end-round', (request: Request, response: Response) => {
	const { sessionID } = request.body;
	response.json(endRound({ sessionID }));
});

app.post('/bet/event', (request: Request, response: Response) => {
	const { sessionID, event } = request.body;
	response.json(recordEvent({ sessionID, event }));
});

app.use((error: Error, _request: Request, response: Response, _next: () => void) => {
	console.error(error);
	response.status(500).json({
		error: {
			message: error.message,
		},
	});
});

export function startServer(port = PORT) {
	return app.listen(port, () => {
		console.log(`mock-rgs listening on http://localhost:${port}`);
	});
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	startServer();
}
