import ApiResponse from "../lib/apiResponse";
import { HttpStatus } from "./httpStatus";

export default class Result<T> {
	error: string | null;
	value: T;

	constructor(value: T, error: string | null = null) {
		this.value = value;
		this.error = error;
	}

	static error(error: string): Result<any> {
		return new Result(null as any, error);
	}

	public clientError(): object {
		return {
			message: this.error,
		};
	}

	public apiResponse(errorStatusCode = HttpStatus.INTERNAL_SERVER_ERROR): ApiResponse {
		if (this.error) {
			return new ApiResponse(errorStatusCode, this.error, this.value ?? {});
		}

		return ApiResponse.success({ body: this.value as any });
	}
}
