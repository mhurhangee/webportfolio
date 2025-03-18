'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionList } from './components/question-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { QuestionSkeleton } from './components/question-skeleton';
import { toast } from 'sonner';
import type { Question, InterviewType } from './schema';

const INTERVIEW_TYPES = {
  job: 'Job Interview',
  media: 'Media Interview',
  pr: 'Public Relations',
  academic: 'Academic Interview',
  customer: 'Customer Interview',
  behavioral: 'Behavioral Assessment',
} as const;

const INTERVIEW_DESCRIPTIONS: Record<InterviewType, string> = {
  job: "Questions to assess a candidate's qualifications, experience, and fit for a specific role.",
  media:
    'Questions designed for interviews with media outlets, focusing on engaging the audience and drawing out interesting responses.',
  pr: 'Questions for public relations contexts, addressing reputation management, crisis communication, and public image.',
  academic:
    'Questions for academic interviews, focusing on research experience, teaching philosophy, and scholarly contributions.',
  customer:
    'Questions to gather feedback from customers, understand their needs, and improve products or services.',
  behavioral:
    'Questions that assess past experiences, decision-making processes, and problem-solving abilities.',
};

const MAX_PREVIOUS_QUESTIONS = 20;

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    role: '',
    missionOutcome: '',
    background: '',
    interviewType: 'job' as InterviewType,
  });

  // Track if the interview type has changed
  const [previousInterviewType, setPreviousInterviewType] = useState<InterviewType | null>(null);

  // Clear questions when interview type changes
  useEffect(() => {
    if (previousInterviewType !== null && previousInterviewType !== formData.interviewType) {
      setQuestions([]);
    }
    setPreviousInterviewType(formData.interviewType);
  }, [formData.interviewType, previousInterviewType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterviewTypeChange = (value: InterviewType) => {
    setFormData((prev) => ({ ...prev, interviewType: value }));
  };

  const generateQuestions = async () => {
    if (!formData.role) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get previous questions text (limited to MAX_PREVIOUS_QUESTIONS)
      const previousQuestions = questions.slice(0, MAX_PREVIOUS_QUESTIONS).map((q) => ({
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
      }));

      const response = await fetch('/api/ai/interview-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          previousQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format: questions array is missing');
      }

      setQuestions((prev) => [...prev, ...data.questions]);

      // Show toast notification
      if (data.questions.length > 0) {
        toast.success(`Added ${data.questions.length} new questions`);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to generate questions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q)));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Make sure both indices are valid
    if (
      index >= 0 &&
      newIndex >= 0 &&
      index < newQuestions.length &&
      newIndex < newQuestions.length
    ) {
      // Use type assertion to tell TypeScript these values are defined
      const itemAtIndex = newQuestions[index] as Question;
      const itemAtNewIndex = newQuestions[newIndex] as Question;

      // Swap the items
      newQuestions[index] = itemAtNewIndex;
      newQuestions[newIndex] = itemAtIndex;

      setQuestions(newQuestions);
    }
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  return (
    <div className="container mx-auto py-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-6 text-center"
      >
        Interview Questions Generator
      </motion.h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start"
      >
        <div className="md:sticky md:top-6">
          <Card className="w-full h-auto">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select value={formData.interviewType} onValueChange={handleInterviewTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTERVIEW_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {INTERVIEW_DESCRIPTIONS[formData.interviewType]}
                  </p>
                </div>

                <div>
                  <Label htmlFor="role">Interviewee&#39;s Role</Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="e.g., Frontend Developer, TV Host"
                    value={formData.role}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="missionOutcome">Mission/Outcome</Label>
                  <Input
                    id="missionOutcome"
                    name="missionOutcome"
                    placeholder="e.g., Building a web app, sustainability initiatives"
                    value={formData.missionOutcome}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="background">Background Information (Optional)</Label>
                  <Textarea
                    id="background"
                    name="background"
                    placeholder="Additional context about the interview or interviewee"
                    value={formData.background}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={generateQuestions}
                    disabled={isLoading || !formData.role}
                    className="flex-1"
                  >
                    {isLoading
                      ? 'Generating...'
                      : questions.length > 0
                        ? 'Generate More Questions'
                        : 'Generate Questions'}
                  </Button>

                  {questions.length > 0 && (
                    <Button variant="outline" onClick={clearQuestions} className="shrink-0">
                      Clear All
                    </Button>
                  )}
                </div>

                {questions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {questions.length > MAX_PREVIOUS_QUESTIONS
                      ? `Using the last ${MAX_PREVIOUS_QUESTIONS} questions to avoid repetition.`
                      : `Using all ${questions.length} questions to avoid repetition.`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {questions.length > 0 && (
            <QuestionList
              questions={questions}
              onDelete={deleteQuestion}
              onToggleFavorite={toggleFavorite}
              onMove={moveQuestion}
            />
          )}
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground mb-2 animate-pulse">
                    Generating new questions...
                  </p>
                  {[...Array(3)].map((_, i) => (
                    <QuestionSkeleton key={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {!isLoading && questions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                No questions generated yet. Fill in the form and click &#34;Generate Questions&#34;.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
