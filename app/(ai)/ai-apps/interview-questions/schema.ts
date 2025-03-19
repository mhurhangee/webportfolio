export type InterviewType = 'job' | 'media' | 'pr' | 'academic' | 'customer' | 'behavioral';

// Categories based on interview type
export type JobCategory =
  | 'technical'
  | 'behavioral'
  | 'situational'
  | 'experience'
  | 'cultural-fit';
export type MediaCategory = 'background' | 'opinion' | 'hypothetical' | 'personal' | 'topical';
export type PRCategory = 'crisis' | 'messaging' | 'reputation' | 'strategy' | 'clarification';
export type AcademicCategory =
  | 'research'
  | 'teaching'
  | 'collaboration'
  | 'methodology'
  | 'philosophy';
export type CustomerCategory = 'satisfaction' | 'usage' | 'feedback' | 'needs' | 'improvement';
export type BehavioralCategory =
  | 'past-experience'
  | 'decision-making'
  | 'conflict'
  | 'leadership'
  | 'teamwork';

export type QuestionCategory =
  | JobCategory
  | MediaCategory
  | PRCategory
  | AcademicCategory
  | CustomerCategory
  | BehavioralCategory;

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  isFavorite: boolean;
  interviewType: InterviewType;
}
