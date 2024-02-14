import { Pool, PoolClient } from 'pg';
import { envConfig } from './envConfig';

export default class Postgres {
	private static instance: Postgres;

	private readonly pgPool = new Pool({
		host: envConfig.postgres.host,
		port: envConfig.postgres.port,
		user: envConfig.postgres.username,
		database: envConfig.postgres.db,
		password: envConfig.postgres.password,
		max: 50,
		min: 2,
		idleTimeoutMillis: 5000,
		ssl: false,
	});

	public pgClient: PoolClient;

	public static getInstance() {
		if (!this.instance) this.instance = new Postgres();
		return this.instance;
	}

	private constructor() {}

	public async connect() {
		this.pgClient = await this.pgPool.connect();
		console.log('connected to postgres');
	}
}
