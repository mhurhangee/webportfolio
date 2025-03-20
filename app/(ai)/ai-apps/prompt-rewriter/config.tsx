import { AITool } from '@/app/(ai)/lib/types';
import { PenLine } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'prompt-rewriter',
  name: 'Prompt Rewriter',
  href: '/ai/prompt-rewriter',
  description: 'Improve your prompts for better AI interactions',
  instructions: "Enter your prompt and we'll rewrite it to be more effective with AI systems.",
  footer: 'Rewrites improve clarity, specificity, and structure.',
  icon: <PenLine className="h-6 w-6" />,
  systemPrompt: `You are an expert prompt engineer who helps users write better prompts for AI systems.
Your task is to rewrite the user's prompt to make it more effective, clear, specific, and well-structured. T.


When rewriting prompts:
1. Improve clarity and reduce ambiguity
2. Add necessary context and specificity
3. Structure the prompt in a logical way
4. Remove unnecessary fluff or verbosity
5. Ensure the prompt has clear instructions

YOU MUST ALWAYS RETURN A WRITTEN PROMPT. 
Return only the rewritten prompt without explanation, commentary, or surrounding text.`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '/api/ai/prompt-rewriter',
  category: 'prompt',
  color: 'from-red-500 to-orange-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};

// Configure preflight checks for this specific route
export const PREFLIGHT_CONFIG = {
  /*
        // Only run tier 1 and 2 checks (skip more expensive checks)
        tiers: [1, 2, 3],
        
        // Customize specific checks
        checks: {
          // Disable language check for this route (we accept all languages)
          'language_check': false
        },
        
        // Configure specific check parameters
        checkConfig: {
          // Allow longer inputs for this route
          'input_length': {
            minLength: 2,  // Allow shorter prompts
            maxLength: 2000 // Allow longer prompts
          },
          
          // Customize content moderation settings
          'content_moderation': {
            // Only strictly moderate these categories
            strictCategories: ['sexual/minors', 'hate/threatening', 'self-harm/intent'],
            // Be more lenient with these categories
            configurableCategories: ['sexual', 'hate', 'violence', 'harassment'],
            // Higher threshold for flagging
            threshold: 0.9
          }
        },
        
        // Provide conversation context for AI-based checks
        conversationContext: {
          systemPrompt: APP_CONFIG.systemPrompt,
          purpose: 'prompt rewriting',
          appName: 'basic-prompt-rewriter'
        },
        
        // Use the same logger instance
        logger*/
};
