import { AITool } from '@/app/(ai)/lib/types';
import { ClipboardCheck } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'summariser',
  name: 'Summariser',
  href: '/ai/summariser',
  description: 'Generate summaries of longer texts',
  instructions: 'Enter the text you want to summarize and select the summary type',
  footer: 'Summaries help distill key information from longer texts',
  icon: <ClipboardCheck className="h-6 w-6" />,
  systemPrompt: `
You are an expert summariser who helps users generate summaries of longer texts.

Use the provided schema to structure your response as JSON.
`,
  externalModel: 'exa-pro',
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/summariser',
  category: 'text',
  color: 'from-amber-500 to-yellow-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
