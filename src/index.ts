import server from './config/app';
import { envConfig } from './config/envConfig';
import Postgres from './config/postgres';
import CacheService from './services/cacheService';

const exitHandler = error => {
	console.error(error);
	if (server) {
		server.close(() => {
			console.info('Server closed');
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

process.on('uncaughtException', exitHandler);
process.on('unhandledRejection', exitHandler);

process.on('SIGTERM', () => {
	exitHandler('SIGTERM received');
});

const start = async () => {
	try {
		await Promise.all([Postgres.getInstance().connect(), CacheService.getInstance().initialize()]);
		await server.listen({ port: envConfig.serverPort });
		console.info(`Listening to port ${envConfig.serverPort}\n`);
	} catch (err) {
		console.error(err);
		exitHandler('starting server failed');
	}
};

start();
