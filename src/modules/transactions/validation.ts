import { z } from 'zod';

export default {
	topUsers: z.object({
		query: z.object({
			month: z.preprocess(i => Number(i), z.number().min(1).max(12)),
			year: z.preprocess(i => Number(i), z.number().min(1800).max(2300)),
		}),
	}),
};
