import { z } from 'zod';

// Schema for URL extraction response
export const extractionResponseSchema = z.object({
  data: z.any(),
  metadata: z.object({
    url: z.string(),
    processedAt: z.string(),
    extractionType: z.string(),
  }),
});

// TypeScript interface for URL extraction response
export type ExtractorResponse = z.infer<typeof extractionResponseSchema>;

// Input form data interface
export interface FormData {
  url: string;
  prompt: string;
}

// Schema for keyword extraction
export interface KeywordItem {
  keyword: string;
  context: string;
  relevance: string;
}

// Schema for validation
export const urlExtractionSchema = z.object({
  extractedContent: z.any(),
  metadata: z.object({
    url: z.string(),
    extractedAt: z.string(),
    contentType: z.string().optional(),
  }),
});