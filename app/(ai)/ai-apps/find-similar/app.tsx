'use client';

import { useState } from 'react';
import { Send, RotateCcw, StopCircle, Link2, ExternalLink, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import { type SimilarResult } from './schema';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export default function FindSimilarTool() {
  const [activeTab, setActiveTab] = useState('input');
  const [url, setUrl] = useState('');
  const { error, handleError, clearError } = useErrorHandler('FindSimilarTool');
  const [similarResults, setSimilarResults] = useState<SimilarResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [numResults, setNumResults] = useState(10);

  // Create a ref to store abort controller
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      // When submitting, clear previous errors and set loading state
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      setActiveTab('results');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Extract domain from URL for exclusion
      let excludeDomains: string[] = [];
      try {
        const domain = new URL(url).hostname;
        excludeDomains = [domain];
      } catch (err) {
        // Invalid URL, will be caught by the backend
      }

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          excludeDomains,
          numResults,
          fetchMetadata: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to find similar websites');
      }

      const data = await response.json();
      setSimilarResults(data);
      toastSuccess('Similar websites found successfully!');
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
    setUrl('');
    setActiveTab('input');
    clearError();
    setSimilarResults(null);
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

  // Format the similarity score as a percentage
  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
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
              <Link2 className="mr-2 h-5 w-5 text-primary" />
              Find Similar Websites
            </CardTitle>
            <CardDescription>Discover websites similar to the one you provide</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">URL Input</TabsTrigger>
                <TabsTrigger value="results" disabled={activeTab === 'input' && !isLoading}>
                  Results
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
                        <h3 className="text-sm font-medium">Website URL</h3>
                        <Input
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the URL of a website to find similar sites
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="num-results">Number of results: {numResults}</Label>
                        </div>
                        <Slider
                          id="num-results"
                          min={5}
                          max={25}
                          step={5}
                          value={[numResults]}
                          onValueChange={(value) => setNumResults(value[0] as number)}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!url.trim() || isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>Finding similar websites...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Find Similar
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
                {isLoading && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Finding similar websites...
                    </p>
                    <p className="text-sm text-muted-foreground animate-pulse">
                      This may take a few seconds.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleStop}>
                      <StopCircle className="mr-2 h-4 w-4 text-destructive" />
                      Stop Search
                    </Button>
                  </div>
                )}

                {isAborted && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <p className="text-sm text-muted-foreground">Search stopped by user.</p>
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

                {similarResults && !isLoading && !isAborted && !error && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Similar websites to {url}</h3>

                    {similarResults.sourceMetadata && (
                      <Card className="overflow-hidden mb-4">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Source Website</CardTitle>
                          <CardDescription className="truncate">{url}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-medium">
                              {similarResults.sourceMetadata.title || 'No title available'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {similarResults.sourceMetadata.description ||
                                'No description available'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {similarResults.results.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No similar websites found.</p>
                    ) : (
                      <div className="space-y-2">
                        {similarResults.results.map((result, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="p-4 flex items-start gap-3">
                              {result.favicon && (
                                <div className="relative w-6 h-6 flex-shrink-0 mt-0.5">
                                  <Image
                                    src={result.favicon}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="rounded-sm"
                                    onError={(e) => {
                                      // Hide the parent div on error
                                      (e.target as HTMLImageElement).parentElement!.style.display =
                                        'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{result.title}</h4>
                                  <Badge variant="outline" className="ml-auto shrink-0">
                                    {formatScore(result.score)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-1">
                                  {result.url}
                                </p>
                                {result.metadata?.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {result.metadata.description}
                                  </p>
                                )}
                                <div className="flex justify-end mt-2">
                                  <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Visit
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <p className="text-xs text-muted-foreground">
              Discover websites similar to your favorite sites.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
