import { apiHandler } from '../../lib/apiHandler';
import { TApiHandler } from '../../lib/types';
import { cacheMiddleware } from '../../middlewares/cache';
import { validate } from '../../middlewares/validate';
import { TTL } from '../../types/ttl';
import Controller from './controller';
import validation from './validation';

const controller = new Controller();

const transactionRoutes: Array<TApiHandler> = [
	apiHandler('GET', '/top-users', controller.topUsers, validate(validation.topUsers)),

	apiHandler(
		'GET',
		'/highest-trans-hour',
		controller.highestTransactionHour,
		validate(validation.highestTransactionHour),
		cacheMiddleware(TTL.hour_1), // since we are returning hourly data, we can cache it for 1 hour easily
	),

	apiHandler(
		'GET',
		'/loyalty-score/:uid',
		controller.loyaltyScore,
		validate(validation.loyaltyScore),
		cacheMiddleware(TTL.day_1),
	),
];

export default transactionRoutes;
