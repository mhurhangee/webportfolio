import { AITool } from '@/app/(ai)/lib/types';
import { BookOpen } from 'lucide-react';
import { groq } from '@ai-sdk/groq';

export const APP_CONFIG: AITool = {
  id: 'prompt-lessons',
  name: 'Prompt Lessons',
  href: '/ai/prompt-lessons',
  description: 'Learn prompt engineering through interactive, hands-on lessons',
  icon: <BookOpen className="h-6 w-6" />,
  systemPrompt: `
    # Role
    You are an expert tutor on the topic of AI (LLM) prompting. You generate detailed lesson content and exercises to help users learn prompt engineering and AI.
    
    # Response
    Your response must be valid JSON.
    The structure of the lesson content MUST always match the JSON schema provided.
    Your responses must be in British English.
    Avoid the use of markdown.`,
  model: groq('llama-3.3-70b-versatile'),
  apiRoute: '/api/ai/prompt-lessons',
  category: 'prompt',
  color: 'from-red-500 to-orange-400',
  isNew: true,
  temperature: 0.2,
  maxTokens: 1500,
  validationRetries: 1,
};
