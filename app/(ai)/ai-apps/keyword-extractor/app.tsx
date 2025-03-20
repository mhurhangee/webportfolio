'use client';

import { useState } from 'react';
import { Send, RotateCcw, CheckCircle2, StopCircle, Shovel } from 'lucide-react';
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
import { type KeywordsResponse } from './schema';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

export default function KeywordExtractorTool() {
  const [activeTab, setActiveTab] = useState('text');
  const [userPrompt, setUserPrompt] = useState('');
  const { error, handleError, clearError } = useErrorHandler('KeywordExtractorTool');
  const [keywordResponse, setKeywordResponse] = useState<KeywordsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [keywordType, setKeywordType] = useState('general');

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

      setActiveTab('extraction');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywordType,
          userPrompt,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate extraction');
      }

      const data = await response.json();
      setKeywordResponse(data);
      toastSuccess('Keywords extracted successfully!');
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
    setActiveTab('text');
    clearError();
    setKeywordResponse(null);
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
            <CardDescription>{APP_CONFIG.description}</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text to analyse</TabsTrigger>
                <TabsTrigger value="extraction" disabled={activeTab === 'text' && !isLoading}>
                  Extracted Keywords
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="text" className="m-0 space-y-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {errorConfig && <PreflightError config={errorConfig} />}

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Keyword Type</h3>
                        <Select onValueChange={(value) => setKeywordType(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select keyword type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="names">Names</SelectItem>
                            <SelectItem value="locations">Locations</SelectItem>
                            <SelectItem value="organizations">Organizations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Your Text</h3>
                        <Textarea
                          withCounter
                          placeholder="Enter the text you want to analyze..."
                          className="min-h-[150px] resize-none pr-16"
                          value={userPrompt}
                          onChange={(e) => {
                            const newValue = e.target.value.slice(0, 1000);
                            setUserPrompt(newValue);
                          }}
                          disabled={isLoading}
                          maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the text from which you want to extract keywords.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!userPrompt.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Extracting keywords...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Extract Keywords
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="extraction" className="m-0 space-y-0">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Extracting keywords...</p>
                    <Button variant="outline" size="sm" onClick={handleStop}>
                      <StopCircle className="mr-2 h-4 w-4 text-destructive" />
                      Stop Extraction
                    </Button>
                  </div>
                )}

                {isAborted && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <p className="text-sm text-muted-foreground">Extraction stopped by user.</p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('text')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {error && !isLoading && !isAborted && (
                  <div className="space-y-4">
                    <PreflightError config={errorConfig!} />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('text')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {keywordResponse && !isLoading && !isAborted && !error && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                      Extracted Keywords
                    </h3>
                    <div className="space-y-4">
                      {keywordResponse.keywords.map((keyword, index) => (
                        <Card key={index} className="bg-muted">
                          <CardHeader>
                            <CardTitle>{keyword.keyword}</CardTitle>
                            <CardDescription>{keyword.context}</CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Extraction
            </Button>
            <p className="text-xs text-muted-foreground">
              {APP_CONFIG.footer || 'Extract important keywords from any text.'}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
