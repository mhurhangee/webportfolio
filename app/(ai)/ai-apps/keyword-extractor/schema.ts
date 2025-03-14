import { z } from 'zod';

export const keywordSingle = z.object({
  keyword: z.string().describe('Extracted keyword'),
  context: z.string().describe('A summary of the context with which the keyword is mentioned'),
});

export const keywordsExtractionSchema = z.object({
  keywords: z.array(keywordSingle).min(1),
});

export type KeywordsResponse = z.infer<typeof keywordsExtractionSchema>;
