import { HttpStatus } from "../utils/httpStatus";

type ResponseParamsType = { body?: object; message?: string; headers?: object };

export default class ApiResponse {
	statusCode: number;
	message: string;
	body: object;
	headers: object;

	// used for middlewares, when we want to return result immediately without forwarding to controller or middlewares after it.
	public returnImmediately = false;

	constructor(statusCode: number, message: string, body: object, headers?: object) {
		this.statusCode = statusCode;
		this.body = body;
		this.message = message;
		this.headers = headers ?? { "content-type": "application/json; charset=utf-8" };
	}

	public isSuccess(): boolean {
		return this.statusCode === HttpStatus.SUCCESS;
	}

	public isComplete(): boolean {
		return this.returnImmediately;
	}

	static redirect({ body = {}, message, headers }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.REDIRECTION;
		if (!message) message = HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body, headers);
	}

	static success({ body = {}, message, headers }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.SUCCESS;
		if (!message) message = HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body, headers);
	}

	static badRequest({ body = {}, message }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.BAD_REQUEST;
		if (!message) message = HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body);
	}

	static internalServerError({ body = {}, message }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.INTERNAL_SERVER_ERROR;
		if (!message) message = HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body);
	}

	static unAuthorized(): ApiResponse {
		const code = HttpStatus.UN_AUTHORIZED;
		const message = HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, {});
	}

	static notFound({ body = {}, headers, message }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.NOT_FOUND;
		message ??= HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body, headers);
	}

	static tooManyRequests({ body = {}, headers, message }: ResponseParamsType): ApiResponse {
		const code = HttpStatus.TOO_MANY_REQUESTS;
		message ??= HttpStatus.getDefaultMessage(code);

		return new ApiResponse(code, message, body, headers);
	}
}
