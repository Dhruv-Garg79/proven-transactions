import ApiRequest from '../lib/apiRequest';
import ApiResponse from '../lib/apiResponse';
import CacheService from '../services/cacheService';
import { TTL } from '../types/ttl';
import Logger from '../utils/logger';

const logger = new Logger('validation middleware');

const cacheService = CacheService.getInstance();

export const cacheMiddleware =
	(timeInMins: TTL) =>
	async (req: ApiRequest): Promise<ApiResponse> => {
		logger.debug(req.url);
		const existing = await cacheService.get(req.url);

		// the cache exists and we can simply return that
		if (existing) {
			logger.debug('response found in cache');
			const resp = ApiResponse.success({ body: existing });
			resp.returnImmediately = true;
			return resp;
		}

		// write to the cache
		req.setPostExecutor(async res => {
			if (res.body) {
				await cacheService.set(req.url, res.body, timeInMins);
			}
		});

		return ApiResponse.success({});
	};
