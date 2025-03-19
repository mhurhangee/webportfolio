import { groq } from '@ai-sdk/groq';

export const DEFAULT_CONFIG = {
  model: groq('llama-3.3-70b-versatile'),
  temperature: 0.3,
  maxTokens: 1024,
};
