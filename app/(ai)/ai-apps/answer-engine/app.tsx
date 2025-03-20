'use client';

import { useState } from 'react';
import { Send, RotateCcw, StopCircle, BookOpen, ExternalLink, Link, Loader2 } from 'lucide-react';
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
import { type AnswerResponse } from './schema';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function AnswerEngineTool() {
  const [activeTab, setActiveTab] = useState('question');
  const [question, setQuestion] = useState('');
  const { error, handleError, clearError } = useErrorHandler('AnswerEngineTool');
  const [answerResponse, setAnswerResponse] = useState<AnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);

  // Create a ref to store abort controller
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      // When submitting, clear previous errors and set loading state
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      setActiveTab('answer');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate answer');
      }

      const data = await response.json();
      setAnswerResponse(data);
      toastSuccess('Answer generated successfully!');
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
    setQuestion('');
    setActiveTab('question');
    clearError();
    setAnswerResponse(null);
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
      <motion.div variants={item}>
        <Card className="h-full overflow-hidden">
          <div className={`h-2 w-full bg-gradient-to-r ${APP_CONFIG.color}`} />
          <CardHeader>
            <CardTitle>
              <h1 className="flex items-center text-2xl md:text-3xl font-bold tracking-tight">
                {APP_CONFIG.icon &&
                  React.cloneElement(APP_CONFIG.icon as React.ReactElement, {
                    className: 'h-7 w-7 mr-2',
                  })}
                <span>{APP_CONFIG.name}</span>
              </h1>
            </CardTitle>
            <CardDescription>{APP_CONFIG.instructions || APP_CONFIG.description}</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="question">Your Question</TabsTrigger>
                <TabsTrigger value="answer" disabled={activeTab === 'question' && !isLoading}>
                  Answer
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="question" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {errorConfig && <PreflightError config={errorConfig} />}

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Your Question</h3>
                        <Textarea
                          withCounter
                          placeholder="What would you like to know?"
                          className="min-h-[100px] resize-none pr-16"
                          value={question}
                          onChange={(e) => {
                            const newValue = e.target.value.slice(0, 500);
                            setQuestion(newValue);
                          }}
                          disabled={isLoading}
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          Ask a question to get a comprehensive answer with citations.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!question.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Generating answer...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Get Answer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="answer" className="m-0 space-y-0">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Generating your answer...
                    </p>
                    <p className="text-sm text-muted-foreground animate-pulse">
                      This may take a few seconds.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleStop}>
                      <StopCircle className="mr-2 h-4 w-4 text-destructive" />
                      Stop Generation
                    </Button>
                  </div>
                )}

                {isAborted && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <p className="text-sm text-muted-foreground">Generation stopped by user.</p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('question')}>
                      Return to Question
                    </Button>
                  </div>
                )}

                {error && !isLoading && !isAborted && (
                  <div className="space-y-4">
                    <PreflightError config={errorConfig!} />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('question')}>
                      Return to Question
                    </Button>
                  </div>
                )}

                {answerResponse && !isLoading && !isAborted && !error && (
                  <div className="space-y-6">
                    <div className="rounded-md bg-card p-6 prose prose-sm dark:prose-invert max-w-none">
                      {answerResponse.answer && (
                        <ReactMarkdown>{answerResponse.answer}</ReactMarkdown>
                      )}
                    </div>

                    {answerResponse.citations && answerResponse.citations.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <h3 className="text-sm font-medium flex items-center">
                          <Link className="h-4 w-4 mr-1" />
                          Sources & Citations
                        </h3>
                        <div className="space-y-2">
                          {answerResponse.citations.map((citation, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm py-1">
                              <span className="text-muted-foreground min-w-[24px]">
                                [{index + 1}]
                              </span>
                              {citation.favicon && (
                                <div className="relative w-4 h-4 flex-shrink-0">
                                  <Image
                                    src={citation.favicon}
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="rounded-sm"
                                    onError={(e) => {
                                      // Hide the parent div on error
                                      (e.target as HTMLImageElement).parentElement!.style.display =
                                        'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-grow min-w-0 flex items-center justify-between gap-2">
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  {citation.title}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  asChild
                                >
                                  <a href={citation.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <p className="text-xs text-muted-foreground">
              {APP_CONFIG.footer || "Powered by Exa's AI research assistant."}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
