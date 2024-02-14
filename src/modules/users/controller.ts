import ApiRequest from '../../lib/apiRequest';
import ApiResponse from '../../lib/apiResponse';
import TransactionsTable from '../../models/transactionsTable';

export default class Controller {
	private readonly trxnTable = new TransactionsTable();

	public getTransaction = async (req: ApiRequest): Promise<ApiResponse> => {
		const { id } = req.param;
		const res = await this.trxnTable.getRowById(id);
		return res.apiResponse();
	};
}
