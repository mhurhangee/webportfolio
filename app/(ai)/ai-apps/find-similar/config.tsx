import { AITool } from '@/app/(ai)/lib/types';
import { Link2 } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'find-similar',
  name: 'Find Similar',
  href: '/ai/find-similar',
  description: 'Discover websites similar to a provided URL',
  icon: <Link2 className="h-6 w-6" />,
  systemPrompt: `
You are an expert at finding similar websites and providing useful information about them.

Use the provided schema to structure your response as JSON.
`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/find-similar',
  category: 'knowledge',
  color: 'from-blue-500 to-cyan-400',
  isNew: true,
  temperature: DEFAULT_CONFIG.temperature,
};
