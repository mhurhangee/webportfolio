import { AITool } from '@/app/(ai)/lib/types';
import { Pickaxe } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'custom-url-extraction',
  name: 'Custom URL Extraction',
  href: '/ai/custom-url-extraction',
  description: 'Define your own schema to extract from a URL',
  icon: <Pickaxe className="h-6 w-6" />,
  systemPrompt: `
        You are an expert at extracting structured data from web content.
        Based on the user's prompt, generate a JSON structure that best represents the requested information.
        Use camelCase for keys and provide meaningful, well-structured data.
`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/custom-url-extraction',
  category: 'text',
  color: 'from-amber-500 to-yellow-500',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
