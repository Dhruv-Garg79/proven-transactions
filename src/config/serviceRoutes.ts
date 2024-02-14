import { TApiHandler } from '../lib/types';
import transactionRoutes from '../modules/transactions/routes';

const serviceRoutes: { [key: string]: Array<TApiHandler> } = {
	transactions: transactionRoutes,
};

export default serviceRoutes;
