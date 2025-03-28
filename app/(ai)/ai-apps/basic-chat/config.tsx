import { AITool } from '@/app/(ai)/lib/types';
import { MessageCircle } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/app/(ai)/lib/defaults';

export const APP_CONFIG: AITool = {
  id: 'basic-chat',
  name: 'Basic Chat',
  href: '/ai/basic-chat',
  description: 'A simple chat interface to interact with AI',
  instructions: 'Ask questions or chat with an AI assistant in a conversational manner',
  footer: 'Chat with an AI assistant for instant answers',
  icon: <MessageCircle className="h-6 w-6" />,
  systemPrompt: `You are a helpful assistant that can answer questions and provide information on a wide range of topics.  You must keep responses concise and to the point.  Use markdown and emojis to format responses.
`,
  model: DEFAULT_CONFIG.model,
  apiRoute: '../ai-apps/basic-chat/api',
  category: 'knowledge',
  color: 'from-blue-500 to-cyan-400',
  isNew: false,
  temperature: DEFAULT_CONFIG.temperature,
  maxTokens: DEFAULT_CONFIG.maxTokens,
};
