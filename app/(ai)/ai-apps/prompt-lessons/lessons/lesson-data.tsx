import { Lesson } from '../schema';

// Comprehensive Lesson Plan for AI, LLM, and Prompting Techniques
// Collect all lessons
export const lessons: Lesson[] = [
  // ==================== FUNDAMENTALS CATEGORY ====================
  {
    id: 'prompt-components',
    title: 'Key Components of Effective AI Prompts',
    topic: 'AI Prompts',
    description:
      'Learn the essential elements that make up well-crafted AI prompts and how they work together',
    difficulty: 'Beginner',
    category: 'Fundamentals',
  },
  {
    id: 'how-llms-work',
    title: 'Understanding How LLMs Process Your Prompts',
    topic: 'LLM Architecture',
    description:
      'Gain insight into how large language models interpret, process, and respond to your prompts',
    difficulty: 'Beginner',
    category: 'Fundamentals',
  },
  {
    id: 'prompt-vs-completion',
    title: 'Prompt vs. Completion: The Input-Output Relationship',
    topic: 'AI Interaction',
    description:
      'Understand the relationship between what you input (prompt) and what you receive (completion)',
    difficulty: 'Beginner',
    category: 'Fundamentals',
  },
  {
    id: 'prompt-anatomy',
    title: 'The Anatomy of a Prompt',
    topic: 'Prompt Structure',
    description:
      'Break down the structure of prompts and learn how each part contributes to the response',
    difficulty: 'Intermediate',
    category: 'Fundamentals',
  },
  {
    id: 'token-economy',
    title: 'Token Economy: Understanding LLM Processing Units',
    topic: 'LLM Tokens',
    description:
      'Learn how LLMs tokenize text and why token management is crucial for effective prompting',
    difficulty: 'Intermediate',
    category: 'Fundamentals',
  },
  {
    id: 'model-capabilities',
    title: 'Understanding AI Model Capabilities and Limitations',
    topic: 'AI Capabilities',
    description:
      'Explore what different LLMs can and cannot do, and how to work within their constraints',
    difficulty: 'Advanced',
    category: 'Fundamentals',
  },

  // ==================== CLARITY CATEGORY ====================
  {
    id: 'clear-instructions',
    title: 'Writing Clear Instructions for AI',
    topic: 'Instruction Clarity',
    description: 'Learn how to craft unambiguous instructions that lead to precise AI responses',
    difficulty: 'Beginner',
    category: 'Clarity',
  },
  {
    id: 'avoiding-ambiguity',
    title: 'Avoiding Ambiguity in Prompts',
    topic: 'Prompt Precision',
    description:
      'Identify and eliminate sources of confusion in your prompts to get more reliable results',
    difficulty: 'Beginner',
    category: 'Clarity',
  },
  {
    id: 'concise-prompting',
    title: 'The Art of Concise Prompting',
    topic: 'Prompt Efficiency',
    description: 'Master the skill of writing prompts that are both brief and effective',
    difficulty: 'Intermediate',
    category: 'Clarity',
  },
  {
    id: 'prompt-intent',
    title: 'Communicating Your Intent Clearly',
    topic: 'Intent Expression',
    description: 'Learn strategies to ensure AI understands exactly what you want to achieve',
    difficulty: 'Intermediate',
    category: 'Clarity',
  },
  {
    id: 'precision-language',
    title: 'Using Precise Language in Prompts',
    topic: 'Language Precision',
    description:
      'Develop skills in selecting exact words and phrases for maximum prompt effectiveness',
    difficulty: 'Advanced',
    category: 'Clarity',
  },

  // ==================== SPECIFICITY CATEGORY ====================
  {
    id: 'detailed-prompts',
    title: 'Creating Detailed Prompts for Better Results',
    topic: 'Prompt Detail',
    description:
      'Learn how adding appropriate details to your prompts leads to more accurate AI responses',
    difficulty: 'Beginner',
    category: 'Specificity',
  },
  {
    id: 'defining-scope',
    title: 'Defining Scope in Your Prompts',
    topic: 'Scope Setting',
    description:
      'Master the technique of setting boundaries for AI responses through careful prompt construction',
    difficulty: 'Intermediate',
    category: 'Specificity',
  },
  {
    id: 'quantitative-guidelines',
    title: 'Using Quantitative Guidelines in Prompts',
    topic: 'Numerical Parameters',
    description: 'Learn how to incorporate specific numbers, ranges, and metrics in your prompts',
    difficulty: 'Intermediate',
    category: 'Specificity',
  },
  {
    id: 'qualitative-parameters',
    title: 'Setting Qualitative Parameters in Prompts',
    topic: 'Quality Control',
    description:
      'Develop techniques for specifying style, tone, complexity, and other qualitative aspects',
    difficulty: 'Advanced',
    category: 'Specificity',
  },

  // ==================== STRUCTURE CATEGORY ====================
  {
    id: 'prompt-formatting',
    title: 'Basic Prompt Formatting Techniques',
    topic: 'Format Basics',
    description:
      'Learn how to structure your prompts for improved readability and processing by AI',
    difficulty: 'Beginner',
    category: 'Structure',
  },
  {
    id: 'multi-part-prompts',
    title: 'Creating Effective Multi-Part Prompts',
    topic: 'Complex Prompts',
    description:
      'Master the art of breaking down complex requests into structured multi-part prompts',
    difficulty: 'Intermediate',
    category: 'Structure',
  },
  {
    id: 'hierarchical-prompting',
    title: 'Hierarchical Prompting Structures',
    topic: 'Prompt Hierarchy',
    description:
      'Learn to create prompts with clear hierarchies that guide AI to process information in a specific order',
    difficulty: 'Intermediate',
    category: 'Structure',
  },
  {
    id: 'conditional-prompting',
    title: 'Conditional Logic in Prompts',
    topic: 'Prompt Logic',
    description:
      'Explore how to incorporate if-then structures and logical conditions in your prompts',
    difficulty: 'Advanced',
    category: 'Structure',
  },
  {
    id: 'syntax-patterns',
    title: 'Advanced Prompt Syntax Patterns',
    topic: 'Prompt Patterns',
    description:
      'Study effective syntactical structures that enhance AI understanding and response quality',
    difficulty: 'Advanced',
    category: 'Structure',
  },

  // ==================== CONTEXT CATEGORY ====================
  {
    id: 'context-importance',
    title: 'The Importance of Context in Prompting',
    topic: 'Context Basics',
    description:
      'Understand why providing appropriate context is critical for getting relevant AI responses',
    difficulty: 'Beginner',
    category: 'Context',
  },
  {
    id: 'background-information',
    title: 'Providing Background Information in Prompts',
    topic: 'Background Context',
    description:
      'Learn techniques for including relevant background information to improve AI responses',
    difficulty: 'Beginner',
    category: 'Context',
  },
  {
    id: 'contextual-examples',
    title: 'Using Examples to Establish Context',
    topic: 'Example-Based Context',
    description: 'Master the use of examples to create a shared understanding with the AI system',
    difficulty: 'Intermediate',
    category: 'Context',
  },
  {
    id: 'context-window',
    title: 'Working With Limited Context Windows',
    topic: 'Context Management',
    description:
      'Develop strategies for effective prompting within the constraints of AI context windows',
    difficulty: 'Intermediate',
    category: 'Context',
  },
  {
    id: 'context-retention',
    title: 'Advanced Context Retention Techniques',
    topic: 'Context Preservation',
    description:
      'Learn sophisticated methods to maintain context across multiple exchanges with AI',
    difficulty: 'Advanced',
    category: 'Context',
  },

  // ==================== TECHNIQUES CATEGORY ====================
  {
    id: 'few-shot-learning',
    title: 'Few-Shot Learning: Teaching by Example',
    topic: 'Example-Based Prompting',
    description:
      'Learn how to guide AI behavior by providing a few examples of desired inputs and outputs',
    difficulty: 'Beginner',
    category: 'Techniques',
  },
  {
    id: 'chain-of-thought',
    title: 'Chain of Thought Prompting',
    topic: 'Reasoning Prompts',
    description: 'Master the technique of guiding AI to show its reasoning process step-by-step',
    difficulty: 'Intermediate',
    category: 'Techniques',
  },
  {
    id: 'role-prompting',
    title: 'Role-Based Prompting Strategies',
    topic: 'AI Persona',
    description:
      'Explore how assigning roles or personas to AI can enhance response quality and relevance',
    difficulty: 'Intermediate',
    category: 'Techniques',
  },
  {
    id: 'zero-shot-prompting',
    title: 'Zero-Shot Prompting: No Examples Needed',
    topic: 'Direct Prompting',
    description: 'Learn how to craft prompts that work effectively without providing examples',
    difficulty: 'Intermediate',
    category: 'Techniques',
  },
  {
    id: 'self-consistency',
    title: 'Self-Consistency and Verification in Prompts',
    topic: 'Verification Techniques',
    description:
      'Develop techniques for prompting AI to verify its own outputs and maintain consistency',
    difficulty: 'Advanced',
    category: 'Techniques',
  },
  {
    id: 'tree-of-thought',
    title: 'Tree of Thought Prompting',
    topic: 'Advanced Reasoning',
    description:
      'Master the advanced technique of exploring multiple reasoning paths for complex problems',
    difficulty: 'Advanced',
    category: 'Techniques',
  },
  {
    id: 'retrieval-augmented',
    title: 'Retrieval-Augmented Prompting',
    topic: 'Knowledge Integration',
    description: 'Learn how to integrate external knowledge sources into your prompting strategy',
    difficulty: 'Advanced',
    category: 'Techniques',
  },

  // ==================== FRAMEWORKS CATEGORY ====================
  {
    id: 'prompt-engineering-basics',
    title: 'Prompt Engineering Fundamentals',
    topic: 'Prompt Engineering',
    description:
      'Learn the basic principles and methodologies behind systematic prompt engineering',
    difficulty: 'Beginner',
    category: 'Frameworks',
  },
  {
    id: 'task-oriented-framework',
    title: 'Task-Oriented Prompting Framework',
    topic: 'Task Framework',
    description:
      'Master a structured approach to designing prompts based on specific task requirements',
    difficulty: 'Intermediate',
    category: 'Frameworks',
  },
  {
    id: 'crispe-framework',
    title: 'The CRISPE Prompting Framework',
    topic: 'CRISPE Method',
    description:
      'Learn to apply the Capacity, Role, Insight, Statement, Personality, Experiment framework',
    difficulty: 'Intermediate',
    category: 'Frameworks',
  },
  {
    id: 'react-framework',
    title: 'The ReAct Prompting Framework',
    topic: 'ReAct Method',
    description: 'Master the Reasoning + Acting framework for complex problem-solving with AI',
    difficulty: 'Advanced',
    category: 'Frameworks',
  },
  {
    id: 'systematic-prompting',
    title: 'Systematic Prompt Design Methodology',
    topic: 'Design Methodology',
    description: 'Develop a systematic approach to creating, testing, and refining prompts',
    difficulty: 'Advanced',
    category: 'Frameworks',
  },

  // ==================== USE CASES CATEGORY ====================
  {
    id: 'content-creation',
    title: 'Prompting for Content Creation',
    topic: 'Content Generation',
    description: 'Learn specific prompting techniques for generating high-quality written content',
    difficulty: 'Beginner',
    category: 'Use Cases',
  },
  {
    id: 'code-generation',
    title: 'Effective Prompts for Code Generation',
    topic: 'Programming Assistance',
    description: 'Master specialized prompting techniques for generating and debugging code',
    difficulty: 'Intermediate',
    category: 'Use Cases',
  },
  {
    id: 'data-analysis',
    title: 'Prompting for Data Analysis and Insights',
    topic: 'Data Understanding',
    description: 'Develop prompting strategies for extracting insights and analyzing complex data',
    difficulty: 'Intermediate',
    category: 'Use Cases',
  },
  {
    id: 'creative-writing',
    title: 'Prompts for Creative Writing and Storytelling',
    topic: 'Creative Generation',
    description:
      'Explore techniques for eliciting creative, engaging narratives and content from AI',
    difficulty: 'Intermediate',
    category: 'Use Cases',
  },
  {
    id: 'research-assistance',
    title: 'Prompting for Research Assistance',
    topic: 'Research Support',
    description:
      'Learn how to craft prompts that help with literature reviews, hypothesis generation, and research planning',
    difficulty: 'Advanced',
    category: 'Use Cases',
  },
  {
    id: 'multimodal-prompting',
    title: 'Multimodal Prompting Techniques',
    topic: 'Cross-Modal AI',
    description:
      'Master advanced techniques for prompting AI systems that work with both text and images',
    difficulty: 'Advanced',
    category: 'Use Cases',
  },

  // ==================== ETHICS CATEGORY ====================
  {
    id: 'ethical-prompting',
    title: 'Ethical Considerations in Prompt Design',
    topic: 'Prompt Ethics',
    description:
      'Understand the ethical implications of different prompting strategies and content',
    difficulty: 'Beginner',
    category: 'Ethics',
  },
  {
    id: 'bias-mitigation',
    title: 'Identifying and Mitigating Bias in Prompts',
    topic: 'Bias Prevention',
    description:
      'Learn techniques to recognize and reduce potential biases in your prompts and AI responses',
    difficulty: 'Intermediate',
    category: 'Ethics',
  },
  {
    id: 'truthfulness-promotion',
    title: 'Promoting Truthfulness in AI Responses',
    topic: 'Accuracy Encouragement',
    description:
      'Develop strategies for encouraging factual accuracy and truthfulness in AI outputs',
    difficulty: 'Intermediate',
    category: 'Ethics',
  },
  {
    id: 'responsible-ai-use',
    title: 'Responsible AI Interaction Guidelines',
    topic: 'Responsible Use',
    description: 'Establish best practices for responsible and ethical interaction with AI systems',
    difficulty: 'Advanced',
    category: 'Ethics',
  },

  // ==================== EVALUATION CATEGORY ====================
  {
    id: 'prompt-testing',
    title: 'Basic Prompt Testing and Iteration',
    topic: 'Prompt Testing',
    description: 'Learn methods for systematically testing and improving your prompts',
    difficulty: 'Beginner',
    category: 'Evaluation',
  },
  {
    id: 'response-analysis',
    title: 'Analyzing and Interpreting AI Responses',
    topic: 'Response Evaluation',
    description: 'Develop skills in evaluating AI outputs to determine quality and usefulness',
    difficulty: 'Intermediate',
    category: 'Evaluation',
  },
  {
    id: 'prompt-benchmarking',
    title: 'Benchmarking Prompt Performance',
    topic: 'Performance Metrics',
    description:
      'Learn how to quantitatively measure and compare the effectiveness of different prompts',
    difficulty: 'Intermediate',
    category: 'Evaluation',
  },
  {
    id: 'prompt-versioning',
    title: 'Prompt Versioning and A/B Testing',
    topic: 'Comparative Testing',
    description:
      'Master techniques for maintaining prompt versions and conducting comparative tests',
    difficulty: 'Advanced',
    category: 'Evaluation',
  },
  {
    id: 'prompt-optimization',
    title: 'Advanced Prompt Optimization Methods',
    topic: 'Optimization Techniques',
    description:
      'Explore sophisticated techniques for fine-tuning prompts to maximize effectiveness',
    difficulty: 'Advanced',
    category: 'Evaluation',
  },
];

// Helper function to get all lessons
export function getAllLessons(): Lesson[] {
  return lessons;
}

// Helper function to get lesson by ID
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

// Helper function to get lessons by category
export function getLessonsByCategory(category: string): Lesson[] {
  return lessons.filter((lesson) => lesson.category === category);
}

// Helper function to get lessons by difficulty
export function getLessonsByDifficulty(difficulty: string): Lesson[] {
  return lessons.filter((lesson) => lesson.difficulty === difficulty);
}
