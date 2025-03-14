import { z } from 'zod';

// Define the schema for the tutor response
export const tutorResponseSchema = z.object({
  analysis: z.object({
    strengths: z.array(z.string().describe('Specific things the user did well in their prompt')),
    improvements: z.array(z.string().describe('Specific areas where the prompt could be improved')),
  }),
  explanation: z
    .string()
    .describe("Detailed explanation of the prompt's effectiveness and suggestions for improvement"),
  examples: z.object({
    before: z.string().describe('The original prompt or a representation of similar issues'),
    after: z.string().describe('An improved version showing the suggested changes'),
  }),
  principles: z.array(
    z.string().describe('Relevant prompt engineering principles that apply to this case')
  ),
  nextLessonSuggestion: z
    .string()
    .describe(
      'Suggestion for what the user should focus on learning next to improve their prompting skills'
    ),
});

export type TutorResponse = z.infer<typeof tutorResponseSchema>;
