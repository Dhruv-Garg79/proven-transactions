import fastify, { FastifyInstance } from 'fastify';
import { envConfig } from './envConfig';
import serviceRoutes from './serviceRoutes';

const server: FastifyInstance = fastify({});

console.log('\nAvailable routes:');
Object.keys(serviceRoutes).forEach(serviceName => {
	serviceRoutes[serviceName].forEach(route => {
		console.log(route.method.padEnd(7) + `http://localhost:${envConfig.serverPort}/api/${serviceName}${route.path}`);
		server.route({
			method: route.method,
			url: `/api/${serviceName}${route.path}`,
			handler: route.handler,
		});
	});
});

export default server;
