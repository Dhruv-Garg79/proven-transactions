import { apiHandler } from '../../lib/apiHandler';
import { TApiHandler } from '../../lib/types';
import { validate } from '../../middlewares/validate';
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
	),
	apiHandler('GET', '/loyalty-score/:uid', controller.loyaltyScore, validate(validation.loyaltyScore)),
];

export default transactionRoutes;
