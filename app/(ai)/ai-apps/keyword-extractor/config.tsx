// File: /home/mjh/front/apps/web/app/(ai)/ai-apps/prompt-tutor/config.tsx

import { AITool } from '@/app/(ai)/lib/types';
import { Shovel } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'keyword-extractor',
  name: 'Keyword Extractor',
  href: '/ai/keyword-extractor',
  description: 'Extract keywords from text to improve searchability and organization',
  icon: <Shovel className="h-6 w-6" />,
  systemPrompt: `
You are an expert keyword extractor who helps users identify and extract keywords from text to improve searchability and organization.

Use the provided schema to structure your response as JSON.
`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/keyword-extractor',
  category: 'text',
  color: 'from-emerald-500 to-teal-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
