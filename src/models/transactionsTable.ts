import { z } from 'zod';
import BaseTable from './interface/baseTable';

export type TUser = z.infer<typeof TransactionsTable.schema>;

export default class TransactionsTable extends BaseTable<TUser> {
	static readonly table = 'transactions';

	static readonly schema = z.object({
		transactionid: z.string(),
		userid: z.string(),
		amount: z.string(),
		timestamp: z.date(),
	});

	constructor() {
		super(TransactionsTable.name, TransactionsTable.table, TransactionsTable.schema, 'transactionid');
	}
}
