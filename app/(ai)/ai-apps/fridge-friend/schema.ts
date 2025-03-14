import { z } from 'zod';

// Define the schema for a single recipe suggestion
export const recipeSuggestionSchema = z.object({
  id: z.string().describe('Unique identifier for the recipe'),
  title: z.string().describe('Name of the recipe'),
  description: z.string().describe('Brief description of the recipe'),
  ingredientsUsed: z
    .array(z.string())
    .describe("List of ingredients from user's input that are used in this recipe"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of the recipe'),
  prepTime: z.string().describe("Preparation time (e.g., '15 mins', '1 hour')"),
  matchPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Percentage of user's ingredients used in this recipe"),
});

// Define the schema for recipe suggestions response
export const recipeSuggestionsSchema = z.object({
  suggestions: z
    .array(recipeSuggestionSchema)
    .describe('List of recipe suggestions based on ingredients'),
});

// Define the schema for a detailed recipe
export const recipeSchema = z.object({
  title: z.string().describe('Name of the recipe'),
  description: z.string().describe('Brief description of the recipe'),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe('Ingredient name'),
        amount: z.string().describe("Amount needed (e.g., '2 tbsp', '1 cup')"),
        fromUserInput: z
          .boolean()
          .describe("Whether this ingredient was in the user's original input"),
      })
    )
    .describe('List of ingredients with amounts'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
  tips: z.array(z.string()).optional().describe('Optional cooking tips'),
  prepTime: z.string().describe('Preparation time'),
  cookTime: z.string().describe('Cooking time'),
  servings: z.number().describe('Number of servings'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of the recipe'),
});

// Export types
export type RecipeSuggestion = z.infer<typeof recipeSuggestionSchema>;
export type RecipeSuggestions = z.infer<typeof recipeSuggestionsSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
