'use client';

import { useState, useRef } from 'react';
import {
  Shield,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  StopCircle,
  ArrowRight,
  ExternalLink,
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
import { type FactCheckResponse } from './schema';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function FactCheckerTool() {
  const [activeTab, setActiveTab] = useState('input');
  const [userText, setUserText] = useState('');
  const { error, handleError, clearError } = useErrorHandler('FactCheckerTool');
  const [factCheckResponse, setFactCheckResponse] = useState<FactCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);

  // Create a ref to store abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim()) return;

    try {
      // When submitting, clear previous errors and set loading state
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      // Switch to results tab immediately
      setActiveTab('results');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userText }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fact-check text');
      }

      const data = await response.json();
      setFactCheckResponse(data);
      toastSuccess('Fact-checking completed!');
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
    setUserText('');
    setActiveTab('input');
    clearError();
    setFactCheckResponse(null);
    setIsLoading(false);
    setIsAborted(false);

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const getAssessmentBadge = (assessment: string) => {
    switch (assessment) {
      case 'True':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" /> True
          </Badge>
        );
      case 'False':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="mr-1 h-3 w-3" /> False
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="mr-1 h-3 w-3" /> Insufficient Information
          </Badge>
        );
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
                <TabsTrigger value="input">Input Text</TabsTrigger>
                <TabsTrigger value="results" disabled={activeTab === 'input' && !isLoading}>
                  Fact-Check Results
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="input" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {errorConfig && <PreflightError config={errorConfig} />}

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Text to Fact-Check</h3>
                        <Textarea
                          withCounter
                          maxLength={1000}
                          placeholder="Enter text containing factual claims that you want to verify..."
                          className="min-h-[200px] resize-none"
                          value={userText}
                          onChange={(e) => setUserText(e.target.value)}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter text with factual claims to check their accuracy. The AI will
                          extract claims and verify them against reliable sources.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!userText.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Fact-checking in progress...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Check Facts
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="results" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {isLoading && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Fact-checking your text...</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStop}
                          className="h-8 gap-1"
                        >
                          <StopCircle className="h-4 w-4" />
                          Stop
                        </Button>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full animate-pulse bg-primary"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Extracting claims and checking facts using web search...
                      </p>
                    </div>
                  )}

                  {isAborted && (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Fact-checking stopped
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              The fact-checking process was stopped. You can try again or modify
                              your text.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoading && !isAborted && factCheckResponse && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Fact-Check Results</h3>
                        <p className="text-sm text-muted-foreground">
                          {factCheckResponse.claims.length} claims were identified and verified.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {factCheckResponse.claims.map((claim, index) => (
                          <div
                            key={index}
                            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                          >
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h4 className="text-base font-medium">Claim {index + 1}</h4>
                                {getAssessmentBadge(claim.assessment)}
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium">Claim:</p>
                                <p className="rounded-md bg-muted p-2 text-sm">{claim.claim}</p>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium">Assessment:</p>
                                <p className="text-sm">{claim.summary}</p>
                              </div>

                              {claim.assessment === 'False' && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Corrected Text:</p>
                                  <div className="rounded-md bg-green-50 p-2 text-sm text-green-900">
                                    {claim.fixedOriginalText}
                                  </div>
                                </div>
                              )}

                              {claim.sources && claim.sources.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-slate-600">Sources:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {claim.sources.map((source, sourceIndex) => (
                                      <Link
                                        key={sourceIndex}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                      >
                                        <span>{source.title}</span>
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && !factCheckResponse && !isAborted && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shield className="mb-2 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No fact-check results yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Submit text to see fact-checking results here.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{APP_CONFIG.footer}</p>
                  <Button
                    variant="default"
                    onClick={() => setActiveTab('input')}
                    disabled={isLoading}
                  >
                    Edit Text
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}
