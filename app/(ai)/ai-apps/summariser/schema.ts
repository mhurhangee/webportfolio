import { z } from 'zod';

export const summaryResponseSchema = z.object({
  summary: z.string().describe('Generated summary of the text'),
});

export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
