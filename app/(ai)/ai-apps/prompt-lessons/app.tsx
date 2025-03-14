'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import { lessons, getAllLessons } from './lessons/lesson-data';
import { Lesson, LessonContent } from './schema';
import LessonBrowser from './components/lesson-browser';
import LessonContentView from './components/lesson-content';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

export default function PromptLessonsTool() {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | undefined>(undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLessons, setCurrentLessons] = useState<Lesson[]>([]);

  // Reference to the top of the component for scrolling
  const topRef = useRef<HTMLDivElement>(null);

  // Initialize lessons
  useEffect(() => {
    setCurrentLessons(getAllLessons());
  }, []);

  // Effect to scroll to top when active tab changes OR when lesson content loads
  useEffect(() => {
    // Small delay to ensure DOM has updated with new content
    const scrollTimer = setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback if ref isn't available
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [activeTab, lessonContent]);

  // Use the standardized error handler
  const { handleError, clearError } = useErrorHandler('PromptLessonsTool');

  // Function to handle lesson selection and fetch lesson content
  const handleSelectLesson = async (lesson: Lesson) => {
    try {
      clearError();
      // Preflight check: Ensure we have a valid lesson object
      if (!lesson || typeof lesson !== 'object') {
        throw new Error('Invalid lesson provided');
      }

      // Preflight check: Ensure lesson ID is valid
      if (!lesson.id || typeof lesson.id !== 'string') {
        throw new Error('Invalid lesson ID');
      }

      setSelectedLesson(lesson);
      setLessonContent(undefined);
      setError(null);
      setIsLoading(true);
      setActiveTab('lesson');

      const response = await fetch('/api/ai/prompt-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getLesson',
          lessonId: lesson.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Failed to fetch lesson content (${response.status})`
        );
      }

      const data = await response.json();
      console.log('API response:', data);

      // Check if the API returned an error
      if (data.error) {
        throw new Error(data.error.message || 'An unknown error occurred');
      }

      // Ensure content exists in the response
      if (!data.content) {
        throw new Error('API response missing lesson content');
      }

      setLessonContent(data.content);
      toastSuccess(`Loaded lesson: ${lesson.title}`);
      setIsLoading(false);
    } catch (apiError: any) {
      console.error('API error:', apiError);
      handleError(apiError);
      setError({
        code: 'api_error',
        message: apiError.message || 'Failed to generate lesson content',
        severity: 'error',
      });
      setIsLoading(false);
    }
  };

  // Function to handle going back to the browse view
  const handleBack = () => {
    setActiveTab('browse');
    setSelectedLesson(null);
    setLessonContent(undefined);
  };

  const errorConfig = error
    ? getErrorDisplay({
        passed: false,
        code: error.code || 'unknown_error',
        message: error.message || 'An unknown error occurred',
        severity: error.severity || 'error',
        details: error.details,
      })
    : null;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      {/* Reference div at the top of the component for scrolling */}
      <div ref={topRef} aria-hidden={true} />

      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-muted-foreground">{APP_CONFIG.description}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse" onClick={handleBack}>
                  Browse Lessons
                </TabsTrigger>
                <TabsTrigger value="lesson" disabled={!selectedLesson}>
                  Active Lesson
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="browse" className="m-0">
              <CardContent className="p-6">
                {errorConfig && <PreflightError config={errorConfig} />}

                <LessonBrowser
                  lessons={currentLessons}
                  selectedLesson={selectedLesson}
                  onSelectLesson={handleSelectLesson}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value="lesson" className="m-0">
              <CardContent className="p-6">
                {errorConfig && <PreflightError config={errorConfig} />}

                {selectedLesson && (
                  <LessonContentView
                    lesson={selectedLesson}
                    content={lessonContent}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>

              <div className="flex items-center justify-center mt-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={activeTab === 'browse'}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Back to Lessons
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}
