import { generateText } from 'ai';
import { APP_CONFIG } from './config';
import { v4 as uuidv4 } from 'uuid';
import type { InterviewType, Question } from './schema';

// Define interview type specific prompts and categories
const INTERVIEW_CONFIG = {
  job: {
    prompt:
      "Create interview questions to assess the candidate's skills, experience, and fit for the role.",
    categories: ['technical', 'behavioral', 'situational', 'experience', 'cultural-fit'],
  },
  media: {
    prompt:
      'Create interview questions for a media interview that will engage the interviewee and draw out interesting responses.',
    categories: ['background', 'opinion', 'hypothetical', 'personal', 'topical'],
  },
  pr: {
    prompt:
      'Create public relations interview questions that address reputation management, crisis communication, and public image.',
    categories: ['crisis', 'messaging', 'reputation', 'strategy', 'clarification'],
  },
  academic: {
    prompt:
      'Create academic interview questions to assess research experience, teaching philosophy, and scholarly contributions.',
    categories: ['research', 'teaching', 'collaboration', 'methodology', 'philosophy'],
  },
  customer: {
    prompt:
      'Create customer interview questions to gather feedback, understand needs, and improve products/services.',
    categories: ['satisfaction', 'usage', 'feedback', 'needs', 'improvement'],
  },
  behavioral: {
    prompt:
      'Create behavioral interview questions to assess past experiences, decision-making, and problem-solving abilities.',
    categories: ['past-experience', 'decision-making', 'conflict', 'leadership', 'teamwork'],
  },
};

export async function POST(req: Request) {
  try {
    const {
      role,
      missionOutcome,
      background,
      interviewType,
      previousQuestions = [],
    } = await req.json();

    const config = INTERVIEW_CONFIG[interviewType as InterviewType] || INTERVIEW_CONFIG.job;

    // Format previous questions for the prompt
    let previousQuestionsText = '';
    if (previousQuestions.length > 0) {
      previousQuestionsText = `
      IMPORTANT: Avoid generating questions similar to these previously generated questions:
      ${previousQuestions.map((q: Question, i: number) => `${i + 1}. "${q.text}"`).join('\n')}
      
      Please generate completely new and different questions that explore other aspects or topics.
      `;
    }

    // Create a list of valid categories for this interview type
    const validCategories = config.categories.join('", "');

    const prompt = `Generate 5-8 ${interviewType} interview questions for a ${role} position/context.
      ${missionOutcome ? `Context: ${missionOutcome}` : ''}
      ${background ? `Additional background: ${background}` : ''}
      
      ${config.prompt}
      
      ${previousQuestionsText}
      
      Include a mix of different question types and difficulties.
      For each question, assign one of these categories: "${validCategories}"
      
      Format your response as a valid JSON object with a 'questions' array containing objects with 'text', 'category', and 'difficulty' fields.
      Example format:
      {
        "questions": [
          {
            "text": "Question text here",
            "category": "one of the valid categories",
            "difficulty": "medium"
          }
        ]
      }
      DO NOT INCLUDE MARKDOWN FORMATTING OR BACKTICKS.`;

    const { text } = await generateText({
      model: APP_CONFIG.model,
      system:
        'You are an expert interviewer who creates thoughtful, relevant interview questions. Always respond with valid JSON.',
      prompt,
    });

    let parsedContent;
    try {
      parsedContent = JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON response from AI');
    }

    const rawQuestions = parsedContent.questions || [];

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('No questions returned from AI');
    }

    // Validate and default categories if needed
    const questions = rawQuestions.map((q) => {
      // Check if the category is valid for this interview type
      const isValidCategory = config.categories.includes(q.category);

      return {
        id: uuidv4(),
        text: q.text || q.question || '',
        // Use the provided category if valid, otherwise use the first valid category
        category: isValidCategory ? q.category : config.categories[0],
        difficulty: q.difficulty || 'medium',
        isFavorite: false,
        interviewType: interviewType as InterviewType,
      };
    });

    return Response.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate questions',
      },
      { status: 500 }
    );
  }
}
