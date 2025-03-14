import { z } from 'zod';

/**
 * Validate lesson content using the Zod schema
 * @param content Content to validate
 * @returns Validation result with isValid flag and any errors
 */
export const validateSchema = (
  schema: z.Schema,
  content: unknown
): { isValid: boolean; errors: string[] } => {
  // Use Zod for validation with the complete response schema
  const result = schema.safeParse(content);

  if (result.success) {
    return { isValid: true, errors: [] };
  } else {
    // Format and extract error messages from Zod validation
    const formattedErrors = result.error.format();
    const errors: string[] = [];

    // Process the formatted errors into readable messages
    Object.entries(formattedErrors).forEach(([path, error]) => {
      if (path === '_errors') {
        // Add root level errors
        (error as string[]).forEach((err) => {
          if (err) errors.push(err);
        });
      } else if (typeof error === 'object' && '_errors' in error) {
        // Add nested errors with their path
        (error._errors as string[]).forEach((err) => {
          if (err) errors.push(`${path}: ${err}`);
        });
      }
    });

    return {
      isValid: false,
      errors: errors.length > 0 ? errors : ['Failed to validate lesson response structure'],
    };
  }
};
