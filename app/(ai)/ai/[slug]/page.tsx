import React from 'react';
import { getToolBySlug } from '@/app/(ai)/lib/demos-config';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const BasicPromptRewriterTool = dynamic(() => import('@/app/(ai)/ai-apps/prompt-rewriter/app'));
const PromptTutorTool = dynamic(() => import('@/app/(ai)/ai-apps/prompt-tutor/app'));
const PromptLessonsTool = dynamic(() => import('@/app/(ai)/ai-apps/prompt-lessons/app'));
const KeywordExtractorTool = dynamic(() => import('@/app/(ai)/ai-apps/keyword-extractor/app'));
const SummariserTool = dynamic(() => import('@/app/(ai)/ai-apps/summariser/app'));
const InlinePromptRewriterTool = dynamic(
  () => import('@/app/(ai)/ai-apps/inline-prompt-rewriter/app')
);
const FridgeFriendTool = dynamic(() => import('@/app/(ai)/ai-apps/fridge-friend/app'));
const CustomUrlExtractionTool = dynamic(
  () => import('@/app/(ai)/ai-apps/custom-url-extraction/app')
);
const BasicChatTool = dynamic(() => import('@/app/(ai)/ai-apps/basic-chat/app'));
const InterviewGenerator = dynamic(() => import('@/app/(ai)/ai-apps/interview-questions/app'));
const FindSimilarTool = dynamic(() => import('@/app/(ai)/ai-apps/find-similar/app'));
const AnswerEngineTool = dynamic(() => import('@/app/(ai)/ai-apps/answer-engine/app'));
const FactCheckerTool = dynamic(() => import('@/app/(ai)/ai-apps/fact-checker/app'));
const AccessibilityHelperTool = dynamic(
  () => import('@/app/(ai)/ai-apps/accessibility-helper/app')
);

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  // If no tool configuration is found, return 404
  if (!tool) {
    notFound();
  }

  // Render the appropriate tool UI based on the tool type
  const renderToolUI = () => {
    if (tool.id === 'prompt-rewriter') {
      return <BasicPromptRewriterTool />;
    }
    if (tool.id === 'prompt-tutor') {
      return <PromptTutorTool />;
    }
    if (tool.id === 'prompt-lessons') {
      return <PromptLessonsTool />;
    }
    if (tool.id === 'keyword-extractor') {
      return <KeywordExtractorTool />;
    }
    if (tool.id === 'summariser') {
      return <SummariserTool />;
    }
    if (tool.id === 'inline-prompt-rewriter') {
      return <InlinePromptRewriterTool />;
    }
    if (tool.id === 'fridge-friend') {
      return <FridgeFriendTool />;
    }
    if (tool.id === 'custom-url-extraction') {
      return <CustomUrlExtractionTool />;
    }
    if (tool.id === 'basic-chat') {
      return <BasicChatTool />;
    }
    if (tool.id === 'interview-questions') {
      return <InterviewGenerator />;
    }
    if (tool.id === 'find-similar') {
      return <FindSimilarTool />;
    }
    if (tool.id === 'answer-engine') {
      return <AnswerEngineTool />;
    }
    if (tool.id === 'fact-checker') {
      return <FactCheckerTool />;
    }
    if (tool.id === 'accessibility-helper') {
      return <AccessibilityHelperTool />;
    }
    // Default fallback
    return notFound();
  };

  return <div className="container max-w-4xl py-10">{renderToolUI()}</div>;
}
