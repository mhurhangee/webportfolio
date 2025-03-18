import { AITool } from '@/app/(ai)/lib/types';
import { PenLine } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

export const APP_CONFIG: AITool = {
  id: 'interview-questions',
  name: 'Interview Questions Generator',
  href: '/ai/interview-questions',
  description:
    'Generate interview questions for a candidate based on their role, mission outcome, and background',
  icon: <PenLine className="h-6 w-6" />,
  systemPrompt: ``,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/interview-questions',
  category: 'creative',
  color: 'from-blue-500 to-cyan-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
