import { z } from 'zod';

export const answerResponseSchema = z.object({
  answer: z.string().describe('Generated answer to the question'),
  citations: z
    .array(
      z.object({
        title: z.string().describe('Title of the cited source'),
        url: z.string().describe('URL of the cited source'),
        favicon: z.string().optional().describe('Favicon URL of the source'),
      })
    )
    .optional()
    .describe('Citations and sources used for the answer'),
});

export type AnswerResponse = z.infer<typeof answerResponseSchema>;
