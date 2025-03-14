// File: /home/mjh/front/apps/web/app/(ai)/ai-apps/prompt-lessons/components/lesson-examples.tsx
import { XCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface Example {
  good: string;
  bad: string;
  explanation: string;
}

interface LessonExamplesProps {
  examples: Example[];
}

export default function LessonExamples({ examples }: LessonExamplesProps) {
  if (!examples || examples.length === 0) {
    return <div className="text-muted-foreground">No examples available for this lesson.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Examples</h3>
      {examples.map((example, index) => (
        <div key={index} className="space-y-3 bg-accent/20 p-4 rounded-md">
          <div>
            <p className="font-medium flex items-center mb-2">
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
              Poor Example:
            </p>
            <div className="bg-accent/40 p-3 rounded-md">
              <p className="text-sm">{example.bad}</p>
            </div>
          </div>
          <div>
            <p className="font-medium flex items-center mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Better Example:
            </p>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
              <p className="text-sm">{example.good}</p>
            </div>
          </div>
          <div>
            <p className="font-medium flex items-center mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
              Why it&apos;s better:
            </p>
            <p className="text-sm text-muted-foreground">{example.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
