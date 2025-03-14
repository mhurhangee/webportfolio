'use client';

import {
  BookOpen,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  X,
  Landmark,
  LayoutTemplate,
  MessageSquare,
  Crosshair,
  FilePieChart,
  Code2,
  Settings,
  ShieldCheck,
  Microscope,
} from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lesson } from '../schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { allDifficulties, allCategories } from '../schema';
import { motion } from 'framer-motion';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// Difficulty colors mapping
const difficultyColors = {
  Beginner: 'from-green-400 to-emerald-600',
  Intermediate: 'from-yellow-400 to-amber-600',
  Advanced: 'from-rose-400 to-red-600',
};

// Category icons mapping
const categoryIcons = {
  Fundamentals: <Landmark className="h-5 w-5" />,
  Clarity: <Lightbulb className="h-5 w-5" />,
  Specificity: <Crosshair className="h-5 w-5" />,
  Structure: <LayoutTemplate className="h-5 w-5" />,
  Context: <MessageSquare className="h-5 w-5" />,
  Techniques: <FilePieChart className="h-5 w-5" />,
  Frameworks: <Settings className="h-5 w-5" />,
  'Use Cases': <Code2 className="h-5 w-5" />,
  Ethics: <ShieldCheck className="h-5 w-5" />,
  Evaluation: <Microscope className="h-5 w-5" />,
};

interface LessonBrowserProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  selectedLesson?: Lesson | null;
}

export default function LessonBrowser({
  lessons,
  onSelectLesson,
  selectedLesson,
}: LessonBrowserProps) {
  const [filter, setFilter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Apply filters to lessons
  const filteredLessons = lessons.filter((lesson) => {
    // Text search filter
    const matchesSearch =
      !filter ||
      lesson.title.toLowerCase().includes(filter.toLowerCase()) ||
      lesson.description.toLowerCase().includes(filter.toLowerCase());

    // Category filter
    const matchesCategory = !selectedCategory || lesson.category === selectedCategory;

    // Difficulty filter
    const matchesDifficulty = !selectedDifficulty || lesson.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilter('');
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  // Check if any filters are active
  const hasActiveFilters = !!filter || !!selectedCategory || !!selectedDifficulty;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={item} className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Find your next prompt engineering lesson
        </h2>
        <p className="text-muted-foreground">
          Select a lesson below and an AI will generate a lesson for you!
        </p>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {/* Search and filter container */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full px-3 py-2 text-sm border rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {/* Difficulty filter */}
          <div className="w-full md:w-48">
            <Select
              value={selectedDifficulty || 'all'}
              onValueChange={(value) => setSelectedDifficulty(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {allDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category filter */}
          <div className="w-full md:w-48">
            <Select
              value={selectedCategory || 'all'}
              onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Clear all filters"
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilter('')} />
              </Badge>
            )}
            {selectedDifficulty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Difficulty: {selectedDifficulty}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDifficulty(null)} />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredLessons.length === 0
            ? 'No lessons found'
            : `Showing ${filteredLessons.length} ${filteredLessons.length === 1 ? 'lesson' : 'lessons'}`}
          {hasActiveFilters && ' with current filters'}
        </p>
      </motion.div>

      {/* Lesson cards */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        {filteredLessons.map((lesson) => (
          <motion.div key={lesson.id} variants={item}>
            <Card
              className={`h-full overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] ${
                selectedLesson?.id === lesson.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectLesson(lesson)}
            >
              <div
                className={`h-2 w-full bg-gradient-to-r ${difficultyColors[lesson.difficulty as keyof typeof difficultyColors]}`}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center">
                  <CardTitle className="text-md group-hover:text-primary transition-colors duration-300">
                    {lesson.title}
                  </CardTitle>
                </div>
                <div
                  className={`p-2 rounded-full bg-gradient-to-br opacity-80 ${difficultyColors[lesson.difficulty as keyof typeof difficultyColors]} text-primary-foreground transition-all duration-300 hover:opacity-100 hover:shadow-md`}
                >
                  {lesson.category in categoryIcons ? (
                    categoryIcons[lesson.category as keyof typeof categoryIcons]
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{lesson.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {lesson.topic}
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
