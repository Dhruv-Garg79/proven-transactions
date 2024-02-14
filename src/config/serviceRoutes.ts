import { TApiHandler } from '../lib/types';
import transactionRoutes from '../modules/users/routes';

const serviceRoutes: { [key: string]: Array<TApiHandler> } = {
	transactions: transactionRoutes,
};

export default serviceRoutes;
