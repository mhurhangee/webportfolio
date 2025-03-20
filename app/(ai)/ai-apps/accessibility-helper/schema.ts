import { z } from 'zod';

// Schema for a single feedback item
export const feedbackItemSchema = z.object({
  id: z.string(),
  type: z.enum(['critical', 'suggestion', 'positive']),
  category: z.enum(['bias', 'readability', 'clarity', 'structure', 'inclusivity', 'positive']),
  exactText: z.string(),
  explanation: z.string(),
  suggestion: z.string().optional(),
});

export type FeedbackItem = z.infer<typeof feedbackItemSchema>;

// Schema for the summary response
export const summaryResponseSchema = z.object({
  summary: z.object({
    overallScore: z.number().int().min(0).max(100),
    biasScore: z.number().int().min(0).max(100),
    readabilityScore: z.number().int().min(0).max(100),
    clarityScore: z.number().int().min(0).max(100),
    overallFeedback: z.string(),
    strengths: z.array(z.string()),
    criticalIssues: z.array(z.string()),
  }),
});

export type SummaryResponse = z.infer<typeof summaryResponseSchema>;

// Schema for the feedback response
export const feedbackResponseSchema = z.object({
  feedback: z.array(feedbackItemSchema),
});

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;

// Combined analysis response schema - this is what the frontend expects
export const analysisResponseSchema = z.object({
  summary: z.object({
    overallScore: z.number().int().min(0).max(100),
    biasScore: z.number().int().min(0).max(100),
    readabilityScore: z.number().int().min(0).max(100),
    clarityScore: z.number().int().min(0).max(100),
    overallFeedback: z.string(),
    strengths: z.array(z.string()),
    criticalIssues: z.array(z.string()),
  }),
  feedback: z.array(feedbackItemSchema),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
