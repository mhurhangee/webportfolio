import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CardContent,
  CardFooter,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft, RotateCcw, ChevronRight, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation';
import { type RecipeSuggestion } from '../schema';

interface RecipeSuggestionsProps {
  mode: 'strict' | 'flexible' | 'staples';
  isLoading: boolean;
  isAborted: boolean;
  recipeSuggestions: RecipeSuggestion[];
  handleBackToIngredients: () => void;
  handleGetRecipe: (recipeId: string) => Promise<void>;
  handleReset: () => void;
  handleStop: () => void;
  handleRefreshSuggestions: () => Promise<void>;
}

export default function RecipeSuggestions({
  mode,
  isLoading,
  isAborted,
  recipeSuggestions,
  handleBackToIngredients,
  handleGetRecipe,
  handleReset,
  handleStop,
  handleRefreshSuggestions,
}: RecipeSuggestionsProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToIngredients}
              className="flex items-center text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to ingredients
            </Button>

            <Badge variant="outline" className="ml-auto">
              {mode === 'strict'
                ? 'Strict Mode'
                : mode === 'flexible'
                  ? 'Flexible Mode'
                  : 'Pantry Staples Assumed'}
            </Badge>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Recipe Suggestions</h3>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="mt-2 flex space-x-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Button variant="outline" size="sm" onClick={handleStop}>
                    Stop Generation
                  </Button>
                </div>
              </div>
            ) : isAborted ? (
              <div className="text-center text-muted-foreground">
                <p>Generation was stopped. Try again with different ingredients.</p>
              </div>
            ) : recipeSuggestions.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>
                  No recipe suggestions found. Try adding more ingredients or changing the mode.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recipeSuggestions.map((recipe, index) => (
                  <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <CardDescription>{recipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {recipe.ingredientsUsed.map((ingredient, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {recipe.prepTime}
                          </span>
                          <span>{recipe.difficulty}</span>
                        </div>
                        <Badge
                          className={`text-xs ${recipe.matchPercentage > 80 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {recipe.matchPercentage}% match
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => handleGetRecipe(recipe.id)}
                      >
                        View Recipe
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>

        {!isLoading && recipeSuggestions.length > 0 && (
          <Button variant="outline" onClick={handleRefreshSuggestions} disabled={isLoading}>
            <Filter className="mr-2 h-4 w-4" />
            Refresh Suggestions
          </Button>
        )}
      </CardFooter>
    </motion.div>
  );
}
