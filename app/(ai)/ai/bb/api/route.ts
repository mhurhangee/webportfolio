// /apps/web/app/(ai)/ai-apps/basic-prompt-rewriter/route.ts

import { streamText } from 'ai';
import { APP_CONFIG } from './config';

export const runtime = 'edge';
export const maxDuration = 60;

// Handler function with request ID tracking
export async function POST(req: Request) {

  const { prompt } = await req.json();

  // Call the AI service
  const result = streamText({
    model: APP_CONFIG.model,
    system: APP_CONFIG.systemPrompt,
    prompt,
    temperature: APP_CONFIG.temperature,
    maxTokens: APP_CONFIG.maxTokens,
  });

  return result.toDataStreamResponse();
}
