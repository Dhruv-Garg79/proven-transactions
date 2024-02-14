import ApiRequest from '../../lib/apiRequest';
import ApiResponse from '../../lib/apiResponse';
import TransactionsTable from '../../models/transactionsTable';
import CacheService from '../../services/cacheService';
import Logger from '../../utils/logger';

export default class Controller {
	private readonly logger = new Logger('Transaction controller');
	private readonly trxnTable = new TransactionsTable();
	private readonly cache = CacheService.getInstance();

	/**
	 * Find the top N users who have transferred the highest total amount in a month of a given year.
	 */
	public topUsers = async (req: ApiRequest): Promise<ApiResponse> => {
		const { month, year } = req.query;

		const now = new Date();
		const cacheKey = `top-users/${year}/${month}`;
		// we want to do conditional cache, if requested data is old we will cache it
		if (year < now.getFullYear() || month < now.getMonth()) {
			const cachedData = await this.cache.get(cacheKey);
			if (cachedData) {
				this.logger.debug('found cache');
				return ApiResponse.success({ body: cachedData });
			}
		}

		const res = await this.trxnTable.topNUsersForMonth(10, month, year);
		if (!res.error) {
			await this.cache.set(cacheKey, res.value);
		}

		return res.apiResponse();
	};

	/**
	 * Find the 1-hour slot of a day (e.g. 6pm to 7pm, 7pm to 8pm) with the highest number of transactions in each month of the given year.
	 * For e.g. if the input is year 2002, the query should return 12 entries (1 for each month)
	 */
	public highestTransactionHour = async (req: ApiRequest): Promise<ApiResponse> => {
		const year = req.query.year;
		const res = await this.trxnTable.highestTransactionHour(year);
		return res.apiResponse();
	};

	/**
	 * Calculate a loyalty score for each user based on the number of transactions and the total amount transferred.
	 * formula considers both frequency and monetary aspects
	 *
	 * - In general highest investor should get highest loyalty point
	 * - but if someone is investing regularly they also get more score
	 *
	 * so we can do : total_amount * (1 + avg_amount * freq/5)
	 * so acc to this formula on each 5th, 10th, ... investment your score will increase by average invested amount
	 *
	 *
	 * I will cache the response of this API for each user
	 * - we can assume that there is some create transaction API, in which we will invalidate the cache for this user
	 */
	public loyaltyScore = async (req: ApiRequest): Promise<ApiResponse> => {
		const uid = req.param.uid;
		const res = await this.trxnTable.userTransactionStats(uid);
		if (res.error) return res.apiResponse();

		const score = res.value.totalAmount * (1 + res.value.averageAmount * Math.floor(res.value.trxnCount / 5));
		return ApiResponse.success({ body: { score } });
	};
}
