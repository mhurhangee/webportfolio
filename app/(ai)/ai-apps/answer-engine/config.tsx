import { AITool } from '@/app/(ai)/lib/types';
import { BookOpen } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'answer-engine',
  name: 'Answer Engine',
  href: '/ai/answer-engine',
  description: 'Get comprehensive answers to your questions with citations',
  instructions: 'Ask any question to receive a detailed answer with reliable sources',
  footer: "Powered by Exa's AI research assistant",
  icon: <BookOpen className="h-6 w-6" />,
  systemPrompt: ``,
  externalModel: 'exa-pro',
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/answer-engine',
  category: 'knowledge',
  color: 'from-blue-500 to-cyan-400',
  isNew: true,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
