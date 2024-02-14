export default class CacheService {
	private cache: Map<string, any>;

	static instance: CacheService;
	static getInstance(): CacheService {
		if (!CacheService.instance) {
			CacheService.instance = new CacheService();
		}
		return CacheService.instance;
	}

	constructor() {
		this.cache = new Map();
	}

	public set(key: string, value: any) {
		this.cache.set(key, value);
	}

	public get(key: string) {
		return this.cache.get(key);
	}
}
