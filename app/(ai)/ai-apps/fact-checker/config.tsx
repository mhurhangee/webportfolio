import { AITool } from '@/app/(ai)/lib/types';
import { Shield } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'fact-checker',
  name: 'Fact Checker',
  href: '/ai/fact-checker',
  description: 'Verify the accuracy of factual claims in text',
  instructions: 'Submit text to identify and verify factual claims using AI and web search',
  footer: 'Verify facts and improve the accuracy of your content',
  icon: <Shield className="h-6 w-6" />,
  systemPrompt: `You are a fact-checking assistant that helps users verify the accuracy of claims in text.

Your goal is to identify factual claims in text, research their accuracy using reliable sources, and provide clear assessments.

When fact-checking text:
1. Extract specific factual claims from the text
2. Research each claim using reliable sources
3. Assess each claim as True, False, or Insufficient Information
4. Provide a brief explanation for your assessment
5. For false claims, suggest a corrected version of the text
6. Maintain a neutral, objective tone`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/fact-checker',
  category: 'knowledge',
  color: 'from-blue-500 to-cyan-400',
  isNew: true,
  temperature: 0.2, // Lower temperature for more factual responses
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
