import { Redis } from 'ioredis';
import { envConfig } from '../config/envConfig';
import Logger from '../utils/logger';

export default class CacheService {
	private readonly TIMEOUT = 3000; // in milliseconds
	private readonly logger = new Logger(CacheService.name);

	protected client = new Redis({
		host: envConfig.redis.host,
		port: envConfig.redis.port,
		connectTimeout: this.TIMEOUT,
		lazyConnect: true,
		keepAlive: 100000,
	});

	private static instance: CacheService;
	private constructor() {}

	public static getInstance() {
		if (!this.instance) this.instance = new CacheService();

		return this.instance;
	}

	public async initialize() {
		await this.client.connect();
		console.log(`redis connection status ${this.client.status}`);
	}

	public async set(key: string, value: string | number | object, expireAfterMinutes?: number): Promise<boolean> {
		if (!value) return false;
		if (typeof value === 'object') {
			value = JSON.stringify(value);
		}

		this.logger.debug('writing to cache', key);

		if (expireAfterMinutes)
			await this.client
				.pipeline()
				.set(key, value)
				.expire(key, 60 * expireAfterMinutes)
				.exec();
		else await this.client.set(key, value);

		return true;
	}

	public async get<T = void>(key: string) {
		this.logger.debug('reading from cache', key);

		let res = await this.client.get(key);

		if (typeof res === 'string') {
			const isJson = res.charAt(0) === '{' || res.charAt(0) === '[';
			if (!isJson) {
				return res as any;
			}

			try {
				return JSON.parse(res) as T extends void ? object : T;
			} catch (e) {
				this.logger.error('parsing error', e);
			}
		}

		return null;
	}

	public async getMulti(keys: string[]): Promise<Array<string | object | number> | null> {
		const res = await this.client.mget(keys);

		const result = [];
		for (let i = 0; i < res.length; i++) {
			if (res[i] !== null) {
				if (typeof res[i] === 'string' && (res[i].charAt(0) === '{' || res[i].charAt(0) === '[')) {
					try {
						res[i] = JSON.parse(res[i]);
					} catch (e) {
						this.logger.error('parsing error', e);
					}
				}

				result.push(res[i]);
			}
		}

		return result;
	}

	public async invalidate(key: string): Promise<number> {
		this.logger.debug('invalidating cache key', key);

		const res = await this.client.del(key, 'x' + key);
		this.logger.debug(res);
		return res;
	}

	// increment counter
	public async incr(
		key: string,
		expire?: {
			minutes: number;
			fromStart: boolean; // only set expiry if counter value is 1
		},
	) {
		const res = await this.client.incr(key);
		if (expire && (!expire.fromStart || (expire.fromStart && res === 1)))
			await this.client.expire(key, 60 * expire.minutes);
		return res;
	}

	public isConnecting() {
		return this.client.status === 'connecting' || this.client.status === 'reconnecting';
	}

	public isConnected() {
		return this.client.status === 'ready' || this.client.status === 'connect';
	}
}
