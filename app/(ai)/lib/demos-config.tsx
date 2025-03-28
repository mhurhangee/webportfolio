import { AITool, AICategory } from '@/app/(ai)/lib/types';
import { APP_CONFIG as PromptRewriterConfig } from '../ai-apps/prompt-rewriter/config';
import { APP_CONFIG as PromptTutorConfig } from '../ai-apps/prompt-tutor/config';
import { APP_CONFIG as PromptLessonsConfig } from '../ai-apps/prompt-lessons/config';
import { APP_CONFIG as KeywordExtractorConfig } from '../ai-apps/keyword-extractor/config';
import { APP_CONFIG as SummariserConfig } from '../ai-apps/summariser/config';
import { APP_CONFIG as InlinePromptRewriterConfig } from '../ai-apps/inline-prompt-rewriter/config';
import { APP_CONFIG as FridgeFriendConfig } from '../ai-apps/fridge-friend/config';
import { APP_CONFIG as CustomUrlExtractionConfig } from '../ai-apps/custom-url-extraction/config';
import { APP_CONFIG as BasicChatConfig } from '../ai-apps/basic-chat/config';
import { APP_CONFIG as InterviewConfig } from '../ai-apps/interview-questions/config';
import { APP_CONFIG as FindSimilarConfig } from '../ai-apps/find-similar/config';
import { APP_CONFIG as AnswerEngineConfig } from '../ai-apps/answer-engine/config';
import { APP_CONFIG as FactCheckerConfig } from '../ai-apps/fact-checker/config';
import { APP_CONFIG as AccessibilityHelperConfig } from '../ai-apps/accessibility-helper/config';

// Only define the prompt rewriter for now
export const aiTools: AITool[] = [
  PromptLessonsConfig,
  PromptRewriterConfig,
  PromptTutorConfig,
  KeywordExtractorConfig,
  SummariserConfig,
  InlinePromptRewriterConfig,
  FridgeFriendConfig,
  CustomUrlExtractionConfig,
  BasicChatConfig,
  InterviewConfig,
  FindSimilarConfig,
  AnswerEngineConfig,
  FactCheckerConfig,
  AccessibilityHelperConfig,
];

// Organize applications by category
export const aiCategories: AICategory[] = [
  {
    name: 'Prompt Helpers',
    description: 'Utilities to help you craft more effective AI prompts',
    apps: aiTools.filter((app) => app.category === 'prompt'),
  },
  {
    name: 'Knowledge',
    description: 'AI-assistance in finding information',
    apps: aiTools.filter((app) => app.category === 'knowledge'),
  },
  {
    name: 'Text Analysis',
    description: 'Utilities to help you analyse text',
    apps: aiTools.filter((app) => app.category === 'text'),
  },
  {
    name: 'Creative Tools',
    description: 'Get your creative juices flowing with AI-powered tools',
    apps: aiTools.filter((app) => app.category === 'creative'),
  },
];

// Helper function to find a tool by id (slug)
export function getToolBySlug(slug: string): AITool | undefined {
  return aiTools.find((tool) => tool.id === slug);
}

// Helper function to find a tool by href
export function getToolByHref(href: string): AITool | undefined {
  return aiTools.find((tool) => tool.href === href);
}

// Helper function to get all tools
export function getAllTools(): AITool[] {
  return aiTools;
}

// Helper function to get all apps (for backward compatibility)
export function getAllApps(): AITool[] {
  return aiTools;
}

// Helper function to get app by href (for backward compatibility)
export function getAppByHref(href: string): AITool | undefined {
  return getToolByHref(href);
}

// Helper function to get app by slug (for backward compatibility)
export function getAppBySlug(slug: string): AITool | undefined {
  return getToolBySlug(slug);
}
