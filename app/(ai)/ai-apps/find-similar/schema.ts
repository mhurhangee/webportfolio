import { z } from 'zod';

export const metadataSchema = z
  .object({
    title: z.string().describe('Title of the website'),
    description: z.string().describe('Description of the website'),
    image: z.string().optional().describe('OpenGraph image URL of the website'),
  })
  .optional()
  .describe('Metadata for the source URL');

export const resultItemSchema = z.object({
  title: z.string().describe('Title of the similar website'),
  url: z.string().describe('URL of the similar website'),
  score: z.number().describe('Similarity score'),
  favicon: z.string().optional().describe('Favicon URL of the website'),
  description: z
    .string()
    .optional()
    .describe('Brief description or summary of the website content'),
  metadata: metadataSchema.describe('Metadata for this result URL'),
});

export const similarResultSchema = z.object({
  results: z.array(resultItemSchema).describe('List of similar websites'),
  sourceMetadata: metadataSchema,
});

export type SimilarResult = z.infer<typeof similarResultSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type ResultItem = z.infer<typeof resultItemSchema>;
