import * as dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV;
const isProd = env === 'prod';

console.log(`Loading config for ${env} environment`);
dotenv.config({ path: path.resolve(__dirname, `../../.env.${env}`) });

export const envConfig = {
	env: env,
	isProd: isProd,
	serverPort: Number(process.env.SERVER_PORT),
	postgres: {
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT),
		db: process.env.POSTGRES_DB_INSTANCE,
		username: process.env.POSTGRES_USERNAME,
		password: process.env.POSTGRES_PASSWORD,
	},
	redis: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
	},
};
