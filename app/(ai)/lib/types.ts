import { ReactNode } from 'react';
import { LanguageModelV1 } from 'ai';

// Simple tool configuration model
export interface AITool {
  id: string; // Unique identifier used for routing
  name: string; // Display name
  href: string; // Full URL path
  description: string; // Short description
  icon: ReactNode; // Icon componentom';
  systemPrompt?: string; // System prompt if applicable
  model: LanguageModelV1; // AI model e.g. groq('llama-3.1-8b-instant') or openai('gpt-4o-mini')
  apiRoute: string; // API route for this tool
  category: 'prompt' | 'text' | 'creative' | 'chat'; // Category for grouping
  color: string; // Gradient color for UI
  isNew?: boolean; // Flag for new tools
  isExperimental?: boolean; // Flag for experimental tools
  temperature?: number; // Sampling temperature for model
  maxTokens?: number; // Max tokens for model
  validationRetries?: number; // Number of retries for validation
}

export interface AICategory {
  name: string;
  description: string;
  apps: AITool[];
}
