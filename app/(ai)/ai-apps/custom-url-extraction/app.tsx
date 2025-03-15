'use client';

import { useState } from 'react';
import { Send, RotateCcw, StopCircle, Pickaxe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

// Code component for displaying the JSON output
const Code = ({ object }: { object: unknown }) => {
  return (
    <div>
      <pre className="text-sm text-zinc-600 dark:text-zinc-300 leading-6 overflow-auto whitespace-pre-wrap">
        {JSON.stringify(object, null, 2)}
      </pre>
    </div>
  );
};

export default function WebExtractorTool() {
  const [activeTab, setActiveTab] = useState('input');
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const { error, handleError, clearError } = useErrorHandler('WebExtractorTool');
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);

  // Create a ref to store abort controller
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // State to store extracted data
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !prompt.trim()) return;

    try {
      // When submitting, clear previous errors and set loading state
      clearError();
      setIsLoading(true);
      setIsAborted(false);
      setExtractedData(null);

      setActiveTab('result');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Make API request
      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const data = await response.json();
      setExtractedData(data);
      toastSuccess('Content extracted successfully!');
      setIsLoading(false);
    } catch (err: any) {
      // Don't set error for aborted requests
      if (err.name === 'AbortError') {
        setIsAborted(true);
        setIsLoading(false);
        return;
      }

      handleError({
        code: err.code || 'api_error',
        message: err.message || 'An error occurred during processing',
        severity: 'error',
        details: {},
      });
      setIsLoading(false);
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
    setUrl('');
    setPrompt('');
    setActiveTab('input');
    clearError();
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
              <Pickaxe className="mr-2 h-5 w-5 text-primary" />
              Extract Web Content
            </CardTitle>
            <CardDescription>
              Extract structured data from public web pages. Extraction works best on articles,
              blogs, documentation and the like.
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Input</TabsTrigger>
                <TabsTrigger value="result" disabled={activeTab === 'input' && !isLoading}>
                  Result
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
                        <h3 className="text-sm font-medium">Web Page URL</h3>
                        <Input
                          placeholder="e.g. https://en.wikipedia.org/wiki/Cheese"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the URL of the web page you want to analyze.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Define the schema you want to extract
                        </h3>
                        <Textarea
                          withCounter
                          placeholder="e.g. Extract types and varieties of cheese, their characteristics, and their origin..."
                          className="min-h-[100px] resize-none pr-16"
                          value={prompt}
                          onChange={(e) => {
                            const newValue = e.target.value.slice(0, 1000);
                            setPrompt(newValue);
                          }}
                          disabled={isLoading}
                          maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground">
                          Describe what information you want to extract from the web page.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!url.trim() || !prompt.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Extracting content...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Extract Content
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="result" className="m-0 space-y-0">
              <CardContent className="p-6">
                {isAborted && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <p className="text-sm text-muted-foreground">Extraction stopped by user.</p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('input')}>
                      Return to Input
                    </Button>
                  </div>
                )}

                {error && !isLoading && !isAborted && (
                  <div className="space-y-4">
                    <PreflightError config={errorConfig!} />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('input')}>
                      Return to Input
                    </Button>
                  </div>
                )}
                {extractedData && (
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-4">
                      <Code object={extractedData} />
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-4 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 pb-2 animate-spin" />
                      <span className="text-sm animate-pulse">Extracting content...</span>
                    </div>
                    {isLoading && (
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={handleStop}>
                          <StopCircle className="mr-2 h-4 w-4 text-destructive" />
                          Stop Extraction
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  !error &&
                  !isAborted && (
                    <div className="text-sm text-muted-foreground flex justify-center items-center py-12">
                      Your structured output will appear here.
                    </div>
                  )
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Extraction
            </Button>
            <p className="text-xs text-muted-foreground">
              Extract structured data from any web page using AI.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
