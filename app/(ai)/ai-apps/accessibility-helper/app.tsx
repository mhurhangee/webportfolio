'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Accessibility,
  Send,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  StopCircle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import { type AnalysisResponse, type FeedbackItem } from './schema';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'bias':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'readability':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'clarity':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'inclusivity':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'structure':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'positive':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
  }
};

// Helper function to get highlight color for text annotations
const getHighlightColor = (category: string, type: string) => {
  // First prioritize by type
  if (type === 'critical') {
    return 'bg-red-100 dark:bg-red-900/20 border-b-2 border-red-400';
  }
  if (type === 'positive') {
    return 'bg-green-100 dark:bg-green-900/20 border-b-2 border-green-400';
  }

  // Then by category
  switch (category) {
    case 'bias':
      return 'bg-red-50 dark:bg-red-900/10 border-b-2 border-red-300';
    case 'readability':
      return 'bg-blue-50 dark:bg-blue-900/10 border-b-2 border-blue-300';
    case 'clarity':
      return 'bg-amber-50 dark:bg-amber-900/10 border-b-2 border-amber-300';
    case 'inclusivity':
      return 'bg-purple-50 dark:bg-purple-900/10 border-b-2 border-purple-300';
    case 'structure':
      return 'bg-indigo-50 dark:bg-indigo-900/10 border-b-2 border-indigo-300';
    default:
      return 'bg-amber-50 dark:bg-amber-900/10 border-b-2 border-amber-300';
  }
};

// Helper function to get type icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'suggestion':
      return <Info className="h-4 w-4 text-amber-500" />;
    case 'positive':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

// Define a type for the PreflightError component
type ErrorConfig = {
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Component for displaying annotated text with feedback
const AnnotatedText = ({ text, feedback }: { text: string; feedback: FeedbackItem[] }) => {
  if (!text || !feedback || feedback.length === 0) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  // Define types for text segments
  type TextSegment = {
    start: number;
    end: number;
    item: FeedbackItem;
  };

  // Function to find all occurrences of a string in text
  const findAllOccurrences = (str: string, searchStr: string): number[] => {
    const indices: number[] = [];
    let startIndex = 0;
    let index: number;

    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStr.length;
    }

    return indices;
  };

  // Get all feedback text segments and their positions
  const allSegments: TextSegment[] = [];

  feedback.forEach((item) => {
    if (!item.exactText) return;

    const positions = findAllOccurrences(text, item.exactText);
    positions.forEach((position) => {
      allSegments.push({
        start: position,
        end: position + item.exactText.length,
        item,
      });
    });
  });

  // Sort segments by start position
  allSegments.sort((a, b) => a.start - b.start);

  // Simplify by using a non-overlapping approach
  const finalSegments: TextSegment[] = [];
  let lastEnd = -1;

  for (const segment of allSegments) {
    // Only add segments that don't overlap with previously added ones
    if (segment.start >= lastEnd) {
      finalSegments.push(segment);
      lastEnd = segment.end;
    } else if (segment.item.type === 'critical') {
      // For critical issues, we'll prioritize them
      // Find and remove any overlapping segments
      const overlappingIndex = finalSegments.findIndex(
        (s) => s.end > segment.start && s.start < segment.end
      );

      if (overlappingIndex !== -1) {
        finalSegments.splice(overlappingIndex, 1);
        finalSegments.push(segment);
        lastEnd = segment.end;
      }
    }
  }

  // Sort final segments by start position
  finalSegments.sort((a, b) => a.start - b.start);

  // Build the output
  const segments: JSX.Element[] = [];
  let lastIndex = 0;

  for (const segment of finalSegments) {
    // Add text before the current annotation
    if (segment.start > lastIndex) {
      segments.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex, segment.start)}</span>
      );
    }

    // Add the annotated text
    const annotatedText = text.substring(segment.start, segment.end);
    const item = segment.item;

    segments.push(
      <Popover key={`annotation-${segment.start}`}>
        <PopoverTrigger asChild>
          <span
            className={`relative cursor-pointer px-0.5 rounded ${getHighlightColor(
              item.category,
              item.type
            )}`}
          >
            {annotatedText}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={getCategoryColor(item.category)}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Badge>
              <span className="flex items-center text-xs">
                {getTypeIcon(item.type)}
                <span className="ml-1">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </span>
            </div>
            <p className="text-sm font-medium">{item.explanation}</p>
            {item.suggestion && <p className="text-sm">{item.suggestion}</p>}
          </div>
        </PopoverContent>
      </Popover>
    );

    lastIndex = segment.end;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{segments}</div>;
};

// Score card component
const ScoreCard = ({
  label,
  score,
  colorClass,
}: {
  label: string;
  score: number;
  colorClass?: string;
}) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${colorClass || getScoreColor(score)}`}
      >
        {score}
      </div>
      <p className="mt-2 text-sm text-center">{label}</p>
    </div>
  );
};

export default function AccessibilityHelperTool() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [text, setText] = useState('');
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to analyze text
  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setIsLoading(true);
    setIsAborted(false);
    setError(null);

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Switch to feedback tab immediately to show loading state
      setActiveTab('feedback');

      const response = await fetch('/api/ai/accessibility-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze text');
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Ensure the response has the expected structure
      if (
        !data.summary ||
        !data.feedback ||
        !data.summary.strengths ||
        !data.summary.criticalIssues
      ) {
        throw new Error('Invalid response format from the API');
      }

      setAnalysisResponse(data);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setIsAborted(true);
      } else {
        setError((err as Error).message || 'An error occurred during analysis');
        console.error('Analysis error:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAborted(true);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setActiveTab('analyze');
    setError(null);
    setAnalysisResponse(null);
    setIsLoading(false);
    setIsAborted(false);

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-muted-foreground">{APP_CONFIG.description}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Accessibility className="mr-2 h-5 w-5 text-primary" />
              Analyze Text for Accessibility
            </CardTitle>
            <CardDescription>
              Submit text to analyze for bias, readability, clarity, and get suggestions for
              improvement.
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analyze">Write & Analyze</TabsTrigger>
                <TabsTrigger value="feedback" disabled={activeTab === 'analyze' && !isLoading}>
                  Analysis & Feedback
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analyze" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {error && (
                    <PreflightError
                      config={{
                        title: 'Error',
                        description: error,
                        severity: 'error',
                      }}
                    />
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Your Text</h3>
                    <Textarea
                      withCounter
                      maxLength={1000}
                      placeholder="Enter text to analyze for accessibility, bias, and readability..."
                      className="min-h-[200px] resize-none"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter text to receive detailed accessibility analysis with specific
                      suggestions for improvement.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!text.trim() || isLoading}
                    className="w-full sm:w-auto"
                    onClick={analyzeText}
                  >
                    {isLoading ? (
                      <>Analyzing your text...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="feedback" className="m-0 space-y-0">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Analyzing your text...</p>
                    <Button variant="outline" size="sm" onClick={handleStop}>
                      <StopCircle className="mr-2 h-4 w-4 text-destructive" />
                      Stop Analysis
                    </Button>
                  </div>
                )}

                {isAborted && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <p className="text-sm text-muted-foreground">Analysis stopped by user.</p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('analyze')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {error && !isLoading && !isAborted && (
                  <div className="space-y-4">
                    <PreflightError
                      config={{
                        title: 'Error',
                        description: error,
                        severity: 'error',
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('analyze')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {analysisResponse && !isLoading && !isAborted && !error && (
                  <div className="space-y-6">
                    {/* Scores Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Accessibility Scores</h3>
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-center mb-4">
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                              analysisResponse.summary.overallScore >= 80
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : analysisResponse.summary.overallScore >= 60
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : analysisResponse.summary.overallScore >= 40
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {analysisResponse.summary.overallScore}
                          </div>
                        </div>
                        <p className="text-center mb-4 text-sm">Overall Score</p>
                        <div className="grid grid-cols-3 gap-4">
                          <ScoreCard label="Bias" score={analysisResponse.summary.biasScore} />
                          <ScoreCard
                            label="Readability"
                            score={analysisResponse.summary.readabilityScore}
                          />
                          <ScoreCard
                            label="Clarity"
                            score={analysisResponse.summary.clarityScore}
                          />
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-2">
                          <p className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            80-100: Excellent
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            60-79: Good
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                            40-59: Needs Improvement
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                            0-39: Poor
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Annotated Text Section */}
                    <div className="py-6 space-y-4 border-t">
                      <h3 className="text-lg font-medium flex items-center">
                        <Accessibility className="mr-2 h-5 w-5 text-blue-500" />
                        Annotated Text
                      </h3>
                      <div className="prose dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                        <TooltipProvider>
                          <AnnotatedText text={text} feedback={analysisResponse.feedback} />
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hover over or click on highlighted text to see detailed feedback.
                      </p>
                    </div>

                    {/* Overall Feedback Section */}
                    <div className="py-6 space-y-4 border-t">
                      <h3 className="text-lg font-medium flex items-center">
                        <Info className="mr-2 h-5 w-5 text-blue-500" />
                        Overall Feedback
                      </h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{analysisResponse.summary.overallFeedback}</p>
                      </div>
                    </div>

                    {/* Positive Feedback Section */}
                    <div className="py-6 space-y-4 border-t">
                      <h3 className="text-lg font-medium flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                        Strengths
                      </h3>
                      <div>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysisResponse.summary.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Critical Issues Section */}
                    <div className="py-6 space-y-4 border-t">
                      <h3 className="text-lg font-medium flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                        Critical Issues
                      </h3>
                      <div>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysisResponse.summary.criticalIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Analysis
            </Button>
            <p className="text-xs text-muted-foreground">
              Improve text accessibility with AI-powered analysis.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
