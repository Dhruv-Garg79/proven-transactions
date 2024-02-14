import { SafeParseError, SafeParseReturnType, Schema } from 'zod';
import ApiRequest from '../lib/apiRequest';
import ApiResponse from '../lib/apiResponse';
import Logger from '../utils/logger';
import { envConfig } from '../config/envConfig';

const logger = new Logger('validation middleware');

export const validate =
	(schema: Schema<object>) =>
	async (req: ApiRequest): Promise<ApiResponse> => {
		const validateRes: SafeParseReturnType<object, any> = await schema.safeParseAsync(req.get());

		if (!validateRes.success) {
			const failResult = validateRes as SafeParseError<any>;
			logger.error('validation failed %j', failResult.error.errors);

			return ApiResponse.badRequest({
				message: 'validation failed',
				body: envConfig.isProd ? {} : failResult.error.errors,
			});
		}

		if (validateRes.data.body) req.updateBody(validateRes.data.body);
		if (validateRes.data.query) req.updateQuery(validateRes.data.query);

		return ApiResponse.success({ message: 'validation successful', body: {} });
	};
