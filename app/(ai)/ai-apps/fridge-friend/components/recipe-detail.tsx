import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation';
import { type Recipe } from '../schema';

interface RecipeDetailProps {
  isLoading: boolean;
  isAborted: boolean;
  selectedRecipe: Recipe | null;
  handleBackToSuggestions: () => void;
  handleStop: () => void;
  handleReset: () => void;
}

export default function RecipeDetail({
  isLoading,
  isAborted,
  selectedRecipe,
  handleBackToSuggestions,
  handleStop,
  handleReset,
}: RecipeDetailProps) {
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
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" onClick={handleStop}>
                  Stop Generation
                </Button>
              </div>
            </div>
          ) : isAborted ? (
            <div className="text-center text-muted-foreground">
              <p>Generation was stopped. Go back to view other recipes.</p>
            </div>
          ) : !selectedRecipe ? (
            <div className="text-center text-muted-foreground">
              <p>Recipe details not found. Please try another recipe.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedRecipe.title}</h2>
                <p className="text-muted-foreground mt-1">{selectedRecipe.description}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>Prep: {selectedRecipe.prepTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>Cook: {selectedRecipe.cookTime}</span>
                  </div>
                  <div>
                    <Badge>{selectedRecipe.difficulty}</Badge>
                  </div>
                  <div>
                    <span>Serves: {selectedRecipe.servings}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <Badge
                        variant={ingredient.fromUserInput ? 'default' : 'outline'}
                        className="mr-2 h-2 w-2 rounded-full p-0"
                      />
                      <span className="font-medium">{ingredient.amount}</span>
                      <span className="ml-2">{ingredient.name}</span>
                      {!ingredient.fromUserInput && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Added
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Instructions</h3>
                <ol className="space-y-4 ml-5 list-decimal">
                  {selectedRecipe.instructions.map((step, index) => (
                    <li key={index} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.tips && selectedRecipe.tips.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Chef&apos;s Tips</h3>
                  <ul className="space-y-2 list-disc ml-5">
                    {selectedRecipe.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex  justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToSuggestions}
          className="flex items-center text-muted-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to suggestions
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </CardFooter>
    </motion.div>
  );
}
