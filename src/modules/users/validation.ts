import { z } from 'zod';

export default {
	getTransaction: z.object({
		param: z.object({
			id: z.string(),
		}),
	}),
};
