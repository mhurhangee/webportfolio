import React from 'react';
import { getToolBySlug } from '@/app/(ai)/lib/playground-config';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const BasicPromptRewriterTool = dynamic(
  () => import('@/app/(ai)/ai-apps/basic-prompt-rewriter/app')
);
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

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  // If no tool configuration is found, return 404
  if (!tool) {
    notFound();
  }

  // Render the appropriate tool UI based on the tool type
  const renderToolUI = () => {
    if (tool.id === 'basic-prompt-rewriter') {
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
    // Default fallback
    return <div>Tool type not supported yet</div>;
  };

  return <div className="container max-w-4xl py-10">{renderToolUI()}</div>;
}
