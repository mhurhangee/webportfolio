'use client';

import { useState, useRef } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { container, item } from '@/lib/animation';
import { APP_CONFIG } from './config';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

// Import components
import IngredientInput from './components/ingredient-input';
import RecipeSuggestions from './components/recipe-suggestions';
import RecipeDetail from './components/recipe-detail';

import { type RecipeSuggestion, type Recipe } from './schema';

export default function FridgeFriendTool() {
  // State for the three main views
  const [activeView, setActiveView] = useState<'ingredients' | 'suggestions' | 'recipe'>(
    'ingredients'
  );

  // Ingredients input state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [mode, setMode] = useState<'strict' | 'flexible' | 'staples'>('staples');

  // Results state
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler('FridgeFriendTool');
  const [isAborted, setIsAborted] = useState(false);

  // Create a ref to store abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle stopping generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAborted(true);
      setIsLoading(false);
    }
  };

  // Handle resetting everything
  const handleReset = () => {
    setIngredients([]);
    setMode('staples');
    setActiveView('ingredients');
    clearError();
    setRecipeSuggestions([]);
    setSelectedRecipe(null);
    setIsLoading(false);
    setIsAborted(false);

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Handle getting recipe suggestions
  const handleGetSuggestions = async () => {
    if (ingredients.length === 0) return;

    try {
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      setActiveView('suggestions');

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          mode,
          action: 'suggest',
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate recipe suggestions');
      }

      const data = await response.json();
      setRecipeSuggestions(data.suggestions);
      toastSuccess('Recipe suggestions generated successfully!');
    } catch (err: any) {
      // Only handle error if it's not an abort error
      if (err.name !== 'AbortError') {
        handleError({
          code: err.code || 'api_error',
          message: err.message || 'An error occurred during processing',
          severity: 'error',
          details: {},
        });

        setActiveView('ingredients');
      } else {
        setIsAborted(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle getting detailed recipe
  const handleGetRecipe = async (recipeId: string) => {
    try {
      clearError();
      setIsLoading(true);
      setIsAborted(false);

      setActiveView('recipe');

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(APP_CONFIG.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          mode,
          action: 'detail',
          recipeId,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate recipe details');
      }

      const data = await response.json();
      setSelectedRecipe(data);
      toastSuccess('Recipe details generated successfully!');
    } catch (err: any) {
      // Only handle error if it's not an abort error
      if (err.name !== 'AbortError') {
        handleError({
          code: err.code || 'api_error',
          message: err.message || 'An error occurred during processing',
          severity: 'error',
          details: {},
        });

        setActiveView('suggestions');
      } else {
        setIsAborted(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-muted-foreground">{APP_CONFIG.description}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UtensilsCrossed className="mr-2 h-5 w-5 text-primary" />
              Fridge Friend
            </CardTitle>
            <CardDescription>
              Create delicious recipes using only the ingredients you have on hand.
            </CardDescription>
          </CardHeader>

          {activeView === 'ingredients' && (
            <IngredientInput
              ingredients={ingredients}
              setIngredients={setIngredients}
              mode={mode}
              setMode={setMode}
              isLoading={isLoading}
              error={error}
              setError={clearError}
              handleGetSuggestions={handleGetSuggestions}
            />
          )}

          {activeView === 'suggestions' && (
            <RecipeSuggestions
              mode={mode}
              isLoading={isLoading}
              isAborted={isAborted}
              recipeSuggestions={recipeSuggestions}
              handleBackToIngredients={() => setActiveView('ingredients')}
              handleGetRecipe={handleGetRecipe}
              handleReset={handleReset}
              handleStop={handleStop}
              handleRefreshSuggestions={handleGetSuggestions}
            />
          )}

          {activeView === 'recipe' && (
            <RecipeDetail
              isLoading={isLoading}
              isAborted={isAborted}
              selectedRecipe={selectedRecipe}
              handleBackToSuggestions={() => setActiveView('suggestions')}
              handleStop={handleStop}
              handleReset={handleReset}
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
