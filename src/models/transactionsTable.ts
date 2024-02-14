import { z } from 'zod';
import Result from '../utils/result';
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

	public async topNUsersForMonth(
		n: number,
		month: number,
		year: number,
	): Promise<
		Result<
			Array<{
				userid: string;
				totalAmount: number;
			}>
		>
	> {
		try {
			const start = new Date(year, month, 1);
			const end = new Date(year, month + 1, 0);

			const query = `
			select userid, sum(amount) as "totalAmount" from transactions 
			where timestamp between '${start.toISOString()}' and '${end.toISOString()}'
			group by userid
			order by sum(amount) desc
			limit ${n}		
			`;
			const res = await this.postgres.pgClient.query(query);
			return new Result(res.rows);
		} catch (error) {
			this.logger.error(error);
			return Result.error(error.message);
		}
	}

	public async userTransactionStats(uid: string): Promise<
		Result<{
			totalAmount: number;
			averageAmount: number;
			trxnCount: number;
		}>
	> {
		try {
			const query = `
			select userid, sum(amount) as "totalAmount", avg(amount) as "averageAmount", count(userid) as "trxnCount" from transactions 
			where userid = '${uid}'
			group by userid
			`;
			const res = await this.postgres.pgClient.query(query);
			return new Result({
				totalAmount: Number(res.rows[0].totalAmount),
				averageAmount: Number(res.rows[0].averageAmount),
				trxnCount: Number(res.rows[0].trxnCount),
			});
		} catch (error) {
			this.logger.error(error);
			return Result.error(error.message);
		}
	}
}
