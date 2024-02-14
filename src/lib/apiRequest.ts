import { HttpMethod } from "../utils/httpStatus";
import ApiResponse from "./apiResponse";

declare type SendResponseType = (res: ApiResponse) => Promise<void>;

export default class ApiRequest {
	body: any = {};
	query: any = {};
	readonly method: HttpMethod;
	readonly requestId: string;
	readonly uid: string;
	readonly ip: string;
	readonly param: any = {};
	readonly headers: any = {};
	readonly url: string;

	public postExecutor: SendResponseType;

	constructor(
		method: HttpMethod,
		body: any,
		param: any,
		query: any,
		args: { headers: any; requestId: string; url: string },
	) {
		this.method = method;
		this.body = body;
		this.param = param;
		this.query = query;
		this.headers = args.headers;
		this.requestId = args.requestId;
		this.url = args.url;
		this.ip = this.headers["x-forwarded-for"]?.split(",")[0] ?? "";
		this.uid = this.headers["uid"];
	}

	public updateBody(body: any) {
		this.body = body;
	}

	public updateQuery(query: any) {
		this.query = query;
	}

	public get(): { body: any; param: any; query: any; headers: any } {
		return {
			body: this.body,
			param: this.param,
			query: this.query,
			headers: this.headers,
		};
	}

	public setPostExecutor(executor: SendResponseType): void {
		const existing = this.postExecutor;

		this.postExecutor = async (res: ApiResponse) => {
			if (existing) await existing(res);
			await executor(res);
		};
	}

	public async executePostExecutor(res: ApiResponse): Promise<void> {
		if (this.postExecutor) {
			await this.postExecutor(res);
		}
	}

}
