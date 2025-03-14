import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { PreflightError } from '@/app/(ai)/components/preflight-error';
import { getErrorDisplay } from '@/app/(ai)/lib/preflight-checks/error-handler';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation';

interface IngredientInputProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  mode: 'strict' | 'flexible' | 'staples';
  setMode: (mode: 'strict' | 'flexible' | 'staples') => void;
  isLoading: boolean;
  error: any;
  setError: (error: any) => void;
  handleGetSuggestions: () => Promise<void>;
}

export default function IngredientInput({
  ingredients,
  setIngredients,
  mode,
  setMode,
  isLoading,
  error,
  setError,
  handleGetSuggestions,
}: IngredientInputProps) {
  const [currentIngredient, setCurrentIngredient] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle adding an ingredient
  const handleAddIngredient = () => {
    const trimmed = currentIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setCurrentIngredient('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Handle removing an ingredient
  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  // Handle ingredient input keydown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const errorConfig = error
    ? getErrorDisplay({
        passed: false,
        code: error.code,
        message: error.message,
        severity: error.severity,
        details: error.details,
      })
    : null;

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
          {errorConfig && <PreflightError config={errorConfig} onClose={() => setError(null)} />}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">What ingredients do you have?</h3>
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Enter an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddIngredient}
                  disabled={!currentIngredient.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Your ingredients:</h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1.5"
                    >
                      {ingredient}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => handleRemoveIngredient(ingredient)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Challenge Mode:</h3>
              <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as 'strict' | 'flexible' | 'staples')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strict" id="strict" />
                  <Label htmlFor="strict" className="font-normal">
                    Strict Mode (only use listed ingredients)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible" className="font-normal">
                    Flexible Mode (may suggest 1-2 additional items)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staples" id="staples" />
                  <Label htmlFor="staples" className="font-normal">
                    Assume Pantry Staples (salt, pepper, oil, etc.)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button
          onClick={handleGetSuggestions}
          disabled={ingredients.length === 0 || isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-primary rounded-full"></div>
              Finding recipes...
            </div>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Find Recipes
            </>
          )}
        </Button>
      </CardFooter>
    </motion.div>
  );
}
