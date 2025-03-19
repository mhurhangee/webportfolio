import { z } from 'zod';

// Define the schema for extracting claims from text
export const claimsExtractionSchema = z.object({
  claims: z.array(
    z.object({
      claim: z.string().describe('The extracted factual claim'),
      originalText: z
        .string()
        .describe('The original text segment from which the claim was derived'),
    })
  ),
});

// Define source schema
export const sourceSchema = z.object({
  title: z.string().describe('The title of the source'),
  url: z.string().describe('The URL of the source'),
});

// Define the schema for the fact-checking response
export const factCheckResponseSchema = z.object({
  claims: z.array(
    z.object({
      claim: z.string().describe('The extracted factual claim'),
      assessment: z
        .enum(['True', 'False', 'Insufficient Information'])
        .describe("Assessment of the claim's factual accuracy"),
      summary: z
        .string()
        .describe('Brief explanation of why the claim is correct or incorrect, in a single line'),
      fixedOriginalText: z
        .string()
        .describe('If the assessment is False, a corrected version of the original text'),
      sources: z.array(sourceSchema).optional().describe('Sources used to verify the claim'),
    })
  ),
});

export type ClaimsExtraction = z.infer<typeof claimsExtractionSchema>;
export type FactCheckResponse = z.infer<typeof factCheckResponseSchema>;
export type Source = z.infer<typeof sourceSchema>;
