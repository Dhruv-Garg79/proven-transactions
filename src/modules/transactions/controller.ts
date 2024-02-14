import ApiRequest from '../../lib/apiRequest';
import ApiResponse from '../../lib/apiResponse';
import TransactionsTable from '../../models/transactionsTable';

export default class Controller {
	private readonly trxnTable = new TransactionsTable();

	/**
	 * Find the top N users who have transferred the highest total amount in a month of a given year.
	 */
	public topUsers = async (req: ApiRequest): Promise<ApiResponse> => {
		const { month, year } = req.query;
		const res = await this.trxnTable.topNUsersForMonth(10, month, year);
		return res.apiResponse();
	};
}
