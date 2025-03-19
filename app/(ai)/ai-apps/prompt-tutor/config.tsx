import { AITool } from '@/app/(ai)/lib/types';
import { BookOpen } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'prompt-tutor',
  name: 'Prompt Tutor',
  href: '/ai/prompt-tutor',
  description: 'Learn how to craft effective AI prompts',
  icon: <BookOpen className="h-6 w-6" />,
  systemPrompt: `You are an expert prompt engineering tutor who helps users learn how to write more effective prompts for AI systems.

Your goal is to provide actionable feedback, educational content, and interactive lessons that help users improve their prompt writing skills.

When analyzing user prompts:
1. Identify strengths and areas for improvement
2. Explain the reasoning behind your suggestions
3. Provide specific examples of how to improve
4. Use a supportive, educational tone
5. Reference prompt engineering principles and best practices`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/prompt-tutor',
  category: 'prompt',
  color: 'from-red-500 to-orange-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
