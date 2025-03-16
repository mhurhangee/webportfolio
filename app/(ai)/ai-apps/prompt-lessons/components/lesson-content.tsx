'use client';

import { Badge } from '@/components/ui/badge';
import { Lesson, LessonContent } from '../schema';
import {
  Loader2,
  Brain,
  Binoculars,
  Key,
  FileKey,
  Building2,
  XCircle,
  CheckCircle2,
  Lightbulb,
  Smile,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Exercises from './exercises';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LessonContentViewProps {
  lesson: Lesson;
  content?: LessonContent;
  isLoading: boolean;
}

export default function LessonContentView({ lesson, content, isLoading }: LessonContentViewProps) {
  if (isLoading || !content) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Lesson header skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Introduction skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        </div>

        {/* Examples skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[88%]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercises skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center py-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating lesson content...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{lesson.title}</h2>
          <div className="flex gap-2">
            <Badge variant="outline">{lesson.difficulty}</Badge>
            <Badge variant="outline">{lesson.category}</Badge>
          </div>
        </div>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Why Learn This Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-1">
          <Brain className="h-5 w-5 mr-2 text-blue-500" />
          Why learn {lesson.topic}?
        </h3>
        <p>{content.whyLearn}</p>
      </div>

      {/* What Is Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-1">
          <Binoculars className="h-5 w-5 mr-2 text-green-500" />
          What are {lesson.topic}?
        </h3>
        <p>{content.whatIs}</p>
      </div>

      {/* Key Principles Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium flex items-center gap-1">
          <Key className="h-5 w-5 mr-2 text-yellow-500" />
          Key principles
        </h3>

        {content.keyPrinciples.map((principle, index) => (
          <Accordion type="single" collapsible defaultValue={`item-${index}`} key={index}>
            <AccordionItem value={`item-${index}`}>
              <AccordionTrigger>
                <h1 className="font-medium text-md flex">
                  <FileKey className="h-4 w-4 mr-2 text-amber-500" /> {index + 1}. {principle.title}
                </h1>
              </AccordionTrigger>
              <AccordionContent>
                <p>{principle.description}</p>

                {/* Examples within each principle */}
                <div className="space-y-3 mt-4">
                  <h5 className="text-sm font-medium">Examples</h5>
                  {principle.examples?.map((example, exIndex) => (
                    <div key={exIndex} className="space-y-3 bg-accent/20 p-4 rounded-md">
                      <div>
                        <p className="font-medium flex items-center mb-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          Poor Example:
                        </p>
                        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-md">
                          <p className="text-sm">{example.bad}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium flex items-center mb-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          Good Example:
                        </p>
                        <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md">
                          <p className="text-sm">{example.good}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium flex items-center mb-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                          Why it&apos;s better:
                        </p>
                        <p className="text-sm text-muted-foreground">{example.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Exercises
                  exercisePrompt={`
# Topic
Focus for your exercises on the topic of ${principle.title}: ${principle.description}, which is being taught as part of a lesson on ${lesson.title} and the lesson has the overall learning goal of ${lesson.description}. The exercises should have the following difficulty level: ${lesson.difficulty}.`}
                  topic={principle.title.toLowerCase()}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      {/* Practical Applications*/}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-1">
          <Building2 className="h-5 w-5 mr-2 text-purple-500" />
          Practical Applications
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {content.applications.map((application, index) => (
            <li key={index}>{application.scenario}</li>
          ))}
        </ul>
      </div>

      {/* Conclusion */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-1">
          <Smile className="h-5 w-5 mr-2 text-emerald-500" />
          Conclusion
        </h3>
        <p>{content.conclusion}</p>
      </div>
    </div>
  );
}
