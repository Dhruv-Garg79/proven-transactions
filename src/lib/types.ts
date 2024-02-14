import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpMethod } from '../utils/httpStatus';
import ApiRequest from './apiRequest';
import ApiResponse from './apiResponse';

export type TMiddleware = (req: ApiRequest) => Promise<ApiResponse>;
export type TController = (req: ApiRequest) => Promise<ApiResponse>;
export type TApiHandler = {
	method: HttpMethod;
	path: string;
	handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
};
