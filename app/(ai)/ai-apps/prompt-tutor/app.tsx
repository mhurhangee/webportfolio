// File: /home/mjh/front/apps/web/app/(ai)/ai-apps/prompt-tutor/app.tsx

'use client';

import { useState } from 'react';
import {
  BookOpen,
  Send,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Shield,
  ArrowRight,
  StopCircle,
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
import { motion } from 'framer-motion';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import { type TutorResponse } from './schema';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

export default function PromptTutorTool() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [userPrompt, setUserPrompt] = useState('');
  const { error, handleError, clearError } = useErrorHandler('PromptTutorTool');
  const [tutorResponse, setTutorResponse] = useState<TutorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);

  // Create a ref to store abort controller
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    try {
      // When submitting, clear previous errors and set loading state
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      // Switch to feedback tab immediately
      setActiveTab('feedback');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPrompt),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate feedback');
      }

      const data = await response.json();
      setTutorResponse(data);
      toastSuccess('Prompt analysis completed!');
    } catch (err: any) {
      // Don't set error for aborted requests
      if (err.name === 'AbortError') {
        setIsAborted(true);
        return;
      }

      handleError({
        code: err.code || 'api_error',
        message: err.message || 'An error occurred during processing',
        severity: 'error',
        details: {},
      });
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
    setUserPrompt('');
    setActiveTab('analyze');
    clearError();
    setTutorResponse(null);
    setIsLoading(false);
    setIsAborted(false);

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const errorConfig = error
    ? getErrorDisplay({
        passed: false,
        code: error.code,
        message: error.message,
        severity: error.severity,
        details: error.details,
      })
    : null;

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
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Learn Prompt Engineering
            </CardTitle>
            <CardDescription>
              Submit a prompt you&apos;ve written and receive personalized feedback and lessons to
              improve your skills.
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analyze">Write & Analyze</TabsTrigger>
                <TabsTrigger value="feedback" disabled={activeTab === 'analyze' && !isLoading}>
                  Feedback & Learning
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analyze" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {errorConfig && <PreflightError config={errorConfig} />}

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Your Prompt</h3>
                        <Textarea
                          withCounter
                          maxLength={1000}
                          placeholder="Enter a prompt you want to analyze and improve..."
                          className="min-h-[150px] resize-none"
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a prompt you&apos;ve written to get personalized feedback on how to
                          improve it.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!userPrompt.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Analyzing your prompt...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Get Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="feedback" className="m-0 space-y-0">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Analyzing your prompt...</p>
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
                    <PreflightError config={errorConfig!} />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('analyze')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {tutorResponse && !isLoading && !isAborted && !error && (
                  <div className="divide-y">
                    {/* Analysis Section */}
                    <div className="pb-6 space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        Prompt Analysis
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-green-700 dark:text-green-400">
                              Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {tutorResponse?.analysis?.strengths?.map((strength, i) => (
                                <li key={i} className="text-sm">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">
                              Areas to Improve
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {tutorResponse?.analysis?.improvements?.map((improvement, i) => (
                                <li key={i} className="text-sm">
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Explanation Section */}
                    <div className="py-6 space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-blue-500" />
                        Detailed Feedback
                      </h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{tutorResponse?.explanation || 'Detailed feedback will appear here.'}</p>
                      </div>
                    </div>

                    {/* Example Section */}
                    <div className="py-6 space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                        Example Improvements
                      </h3>

                      <div className="grid gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Original</h4>
                          <div className="bg-muted rounded-md p-3">
                            <pre className="text-sm whitespace-pre-wrap">
                              {tutorResponse?.examples?.before ||
                                'Example prompt will appear here.'}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Improved Version</h4>
                          <div className="bg-green-100 dark:bg-green-900/20 rounded-md p-3 border border-green-200 dark:border-green-800">
                            <pre className="text-sm whitespace-pre-wrap">
                              {tutorResponse?.examples?.after ||
                                'Improved version will appear here.'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Principles Section */}
                    <div className="py-6 space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
                        Key Principles
                      </h3>
                      <div>
                        <ul className="list-disc pl-5 space-y-1">
                          {tutorResponse?.principles?.map((principle, i) => (
                            <li key={i}>{principle}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Next Lesson */}
                    <div className="pt-6">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                        <h3 className="text-md font-medium flex items-center">
                          <ArrowRight className="mr-2 h-5 w-5 text-primary" />
                          Next Steps
                        </h3>
                        <p className="text-sm mt-2">
                          {tutorResponse?.nextLessonSuggestion ||
                            'Recommendations will appear here.'}
                        </p>
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
              Improve your prompt writing skills with expert feedback.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
