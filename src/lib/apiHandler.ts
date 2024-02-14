import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { AsyncLocalStorage } from "node:async_hooks";
import { HttpMethod } from "../utils/httpStatus";
import Logger from "../utils/logger";
import ApiRequest from "./apiRequest";
import ApiResponse from "./apiResponse";
import { TController, TMiddleware } from "./types";

const logger = new Logger("Api Handler");

export const asyncLocalStorage = new AsyncLocalStorage<string>();
Logger.setAsyncLocalStorage(asyncLocalStorage);

export const apiHandler = (method: HttpMethod, path: string, handler: TController, ...before: TMiddleware[]) => {
	return {
		method: method,
		path: path,
		handler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
			const requestId = crypto.randomUUID();
			request.id = requestId;
			const startTime = performance.now();
			await asyncLocalStorage.run(requestId, async () => {
				logger.debug(`${request.method} ${request.url}`, {
					headers: request.headers,
					body: request.body,
					query: request.query,
					params: request.params,
				});

				const apiReq = new ApiRequest(method, request.body, request.params, request.query, {
					headers: request.headers,
					url: request.url,
					requestId,
				});

				try {
					// run all before middleware
					// since middleware are supposed to be run synchronously in order, we will need to do this
					for (const middleware of before) {
						const mRes = await middleware(apiReq);

						// return error whenever any middleware fails
						if (!mRes.isSuccess()) return clientReply(reply, apiReq, mRes, startTime);

						// return if explicitly marked as such by middleware
						if (mRes.isComplete()) return clientReply(reply, apiReq, mRes, startTime);
					}

					// actual request is processed here
					const res = await handler(apiReq);

					return clientReply(reply, apiReq, res, startTime);
				} catch (error) {
					logger.error(error, error.stack);
					const r = ApiResponse.internalServerError({ message: error.message });
					return clientReply(reply, apiReq, r, startTime);
				}
			});
		},
	};
};

const clientReply = (reply: FastifyReply, req: ApiRequest, res: ApiResponse, startTime: number) => {
	reply.code(res.statusCode).headers(res.headers).send({
		message: res.message,
		data: res.body,
	});

	const timeTaken = performance.now() - startTime;
	logger.debug(`${req.method} ${req.url} ${res.statusCode} ${timeTaken.toFixed(2)} ms\n`);
};
