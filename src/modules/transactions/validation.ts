import { z } from 'zod';

const yearValidation = z.preprocess(i => Number(i), z.number().min(1800).max(2300));

export default {
	topUsers: z.object({
		query: z.object({
			month: z.preprocess(i => Number(i), z.number().min(1).max(12)),
			year: yearValidation,
		}),
	}),

	highestTransactionHour: z.object({
		query: z.object({
			year: yearValidation,
		}),
	}),

	loyaltyScore: z.object({
		param: z.object({
			uid: z.string(),
		}),
	}),
};
