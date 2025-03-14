import { z } from 'zod';

export const allDifficulties = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const allCategories = [
  'Fundamentals',
  'Clarity',
  'Specificity',
  'Structure',
  'Context',
  'Techniques',
  'Frameworks',
  'Use Cases',
  'Ethics',
  'Evaluation',
] as const;

export const difficultySchema = z.enum(allDifficulties);
export const categorySchema = z.enum(allCategories);

export type Difficulty = z.infer<typeof difficultySchema>;
export type Category = z.infer<typeof categorySchema>;

export const lessonSchema = z.object({
  id: z.string().describe('Unique identifier for the lesson'),
  title: z.string().describe('Display title of the lesson'),
  topic: z.string().describe('Topic covered by the lesson'),
  description: z.string().describe('Brief description of what the lesson covers'),
  difficulty: difficultySchema.describe('Difficulty level of the lesson'),
  category: categorySchema.describe('Category that the lesson belongs to'),
});

export type Lesson = z.infer<typeof lessonSchema>;

// Define the lesson content structure
export const lessonContentSchema = z.object({
  whyLearn: z.string().describe('Explanation of why this topic is important to learn'),
  whatIs: z.string().describe('Clear definition and explanation of the topic'),
  keyPrinciples: z
    .array(
      z.object({
        title: z.string().describe('Name of the principle'),
        description: z.string().describe('A short paragraph explaining the principle'),
        examples: z
          .array(
            z.object({
              good: z.string().describe('Example demonstrating good use of this principle'),
              bad: z.string().describe('Example demonstrating poor use of this principle'),
              explanation: z
                .string()
                .describe(
                  'Explanation of why the good example prompt follows this principle better'
                ),
            })
          )
          .min(1)
          .describe('Example prompts showing the principle in action.'),
      })
    )
    .min(1)
    .describe('Key principles or components of the topic'),
  applications: z
    .array(
      z.object({
        scenario: z
          .string()
          .describe(
            'Description of a real-world scenario where this topic may be useful in the workplace'
          ),
      })
    )
    .min(1)
    .describe(
      'List of practical applications and real word scenarios where this topic may be useful in the workplace focusing'
    ),
  conclusion: z.string().describe('Summary of key takeaways and importance of the topic'),
});

export const lessonContentOptionalSchema = lessonContentSchema;

export type LessonContent = z.infer<typeof lessonContentSchema>;

// Schema for the lesson response from the API
export const lessonResponseSchema = z.object({
  lesson: lessonSchema.describe('The lesson metadata'),
  content: lessonContentSchema.describe('The lesson content'),
});

export type LessonResponse = z.infer<typeof lessonResponseSchema>;

export const exerciseFeedbackSchema = z.object({
  isCorrect: z.boolean().describe("Whether the user's answer is correct"),
  feedback: z.string().describe("Feedback message on the user's answer"),
  explanation: z
    .string()
    .optional() // Make explanation optional
    .describe('Detailed explanation of the feedback'),
  correctAnswer: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe('Correct answer(s) for the exercise'),
  suggestedImprovement: z
    .string()
    .optional()
    .describe('Suggested improvement for "improve" exercises'),
});

export type ExerciseFeedback = z.infer<typeof exerciseFeedbackSchema>;

export const multipleChoiceSingle = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  options: z.array(z.string()).min(4).max(4),
  explanation: z.string().describe('Short explanation of the correct answer'),
  correctOptionIndex: z.number().int().min(0),
});

export const multipleChoiceExerciseGroup = z.object({
  exercises: z.array(multipleChoiceSingle).min(1).max(2),
});

export type MultipleChoiceSingle = z.infer<typeof multipleChoiceSingle>;
export type MultipleChoiceExerciseGroup = z.infer<typeof multipleChoiceExerciseGroup>;

export const trueFalseExerciseSingle = z.object({
  type: z.literal('true-false'),
  statement: z.string(),
  explanation: z.string().describe('Short explanation of the correct answer'),
  isTrue: z.boolean(),
});

export const trueFalseExerciseGroup = z.object({
  exercises: z.array(trueFalseExerciseSingle).min(1).max(2),
});

export type TrueFalseExerciseSingle = z.infer<typeof trueFalseExerciseSingle>;
export type TrueFalseExerciseGroup = z.infer<typeof trueFalseExerciseGroup>;

export const fillInBlankSingle = z.object({
  type: z.literal('fill-in-blank'),
  sentence: z.string().describe('Sentence with [BLANK] placeholder where user should fill in'),
  correctAnswer: z.string().describe('The correct answer to fill in the blank'),
  explanation: z.string().describe('Explanation of why this is the correct answer'),
  context: z.string().describe('Additional context to help the user fill in the blank'),
});

export const fillInBlankExerciseGroup = z.object({
  exercises: z.array(fillInBlankSingle).min(1).max(2),
});

export type FillInBlankSingle = z.infer<typeof fillInBlankSingle>;
export type FillInBlankExerciseGroup = z.infer<typeof fillInBlankExerciseGroup>;

export const improveExerciseSingle = z.object({
  type: z.literal('improve'),
  promptToImprove: z.string().describe('The prompt or text that needs improvement'),
  context: z.string().describe('Context explaining what needs to be improved and why'),
  sampleImprovement: z.string().describe('A sample improved version for reference'),
  criteria: z.array(z.string()).describe('List of criteria to evaluate the improvement against'),
});

export const improveExerciseGroup = z.object({
  exercises: z.array(improveExerciseSingle).min(1).max(2),
});

export type ImproveExerciseSingle = z.infer<typeof improveExerciseSingle>;
export type ImproveExerciseGroup = z.infer<typeof improveExerciseGroup>;

export const constructExerciseSingle = z.object({
  type: z.literal('construct'),
  task: z.string().describe('The task requirements for constructing a prompt'),
  scenario: z.string().describe('Context or scenario for which the prompt should be created'),
  criteria: z
    .array(z.string())
    .describe('List of criteria to evaluate the constructed prompt against'),
  sampleSolution: z.string().describe('A sample well-constructed prompt for reference').optional(),
});

export const constructExerciseGroup = z.object({
  exercises: z.array(constructExerciseSingle).min(1).max(2),
});

export type ConstructExerciseSingle = z.infer<typeof constructExerciseSingle>;
export type ConstructExerciseGroup = z.infer<typeof constructExerciseGroup>;

export const evaluationResultSchema = z.object({
  isGoodImprovement: z.boolean(),
  feedback: z.string(),
  suggestedImprovement: z.string().optional(),
});

// Interface for API error response
export interface ApiError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: string;
}
