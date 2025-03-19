// /apps/web/app/(ai)/ai-apps/basic-prompt-rewriter/app.tsx

'use client';

import { useState, useCallback } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Send, RotateCcw, Clipboard, CheckCircle } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import React from 'react';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

export default function BasicPromptRewriterTool() {
  const [copied, setCopied] = useState(false);
  const { error, handleError, clearError } = useErrorHandler('BasicPromptRewriterTool');

  const { completion, input, isLoading, handleInputChange, handleSubmit, setCompletion, setInput } =
    useCompletion({
      api: APP_CONFIG.apiRoute,
      onError: (error) => {
        handleError(error);
      },
      onFinish: () => {
        if (completion) {
          toastSuccess('Prompt rewritten successfully!');
        }
      },
    });

  const handleCopy = useCallback(() => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      setCopied(true);
      toastSuccess('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [completion]);

  const handleReset = useCallback(() => {
    setInput('');
    setCompletion('');
    clearError();
  }, [setInput, setCompletion, clearError]);

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
            <CardDescription>{APP_CONFIG.instructions}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <form onSubmit={handleSubmit} className="grid gap-4">
                <Textarea
                  withCounter
                  maxLength={1000}
                  placeholder="Enter your prompt here..."
                  className="min-h-32 resize-none"
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Rewrite Prompt
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {completion && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Improved Prompt:</h3>
                  <div className="bg-muted p-4 rounded-md relative">
                    <div className="whitespace-pre-wrap">{completion}</div>
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8">
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <p className="text-xs text-muted-foreground">{APP_CONFIG.footer}</p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
