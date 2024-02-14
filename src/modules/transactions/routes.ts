import { apiHandler } from '../../lib/apiHandler';
import { TApiHandler } from '../../lib/types';
import { validate } from '../../middlewares/validate';
import Controller from './controller';
import validation from './validation';

const controller = new Controller();

const transactionRoutes: Array<TApiHandler> = [
	apiHandler('GET', '/top-users', controller.topUsers, validate(validation.topUsers)),
];

export default transactionRoutes;
