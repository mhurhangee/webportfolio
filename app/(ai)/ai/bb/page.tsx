// /apps/web/app/(ai)/ai-apps/basic-prompt-rewriter/app.tsx

'use client';

import { useState, useCallback } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Send, RotateCcw, Clipboard, CheckCircle } from 'lucide-react';
import { PenLine } from 'lucide-react';
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
import React from 'react';
import { toast } from 'sonner';

export default function BasicPromptRewriterTool() {
  const [copied, setCopied] = useState(false);

  const { completion, input, isLoading, handleInputChange, handleSubmit, setCompletion, setInput } =
    useCompletion({
      api: './bb/api/',
      onError: (error) => {
        console.error(error);
      },
      onFinish: () => {
        if (completion) {
          toast.success('Prompt rewritten successfully!');
        }
      },
    });

  const handleCopy = useCallback(() => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [completion]);

  const handleReset = useCallback(() => {
    setInput('');
    setCompletion('');
  }, [setInput, setCompletion]);

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">BB</h1>
        <p className="text-muted-foreground">BB</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PenLine className="mr-2 h-5 w-5 text-primary" />
              BB
            </CardTitle>
            <CardDescription>
              Enter your prompt and we&apos;ll rewrite it to be more effective with AI systems.
            </CardDescription>
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
            <p className="text-xs text-muted-foreground">
              Rewrites improve clarity, specificity, and structure.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
