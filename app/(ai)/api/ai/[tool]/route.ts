import { NextRequest, NextResponse } from 'next/server';
import { getToolBySlug } from '@/app/(ai)/lib/playground-config';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Extract the tool parameter from the URL directly as a fallback approach
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    // The tool should be the last segment in /api/ai/[tool]
    const toolSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';

    // Ensure we have a valid tool slug
    if (!toolSegment) {
      return NextResponse.json(
        { error: 'Invalid tool path', code: 'invalid_path' },
        { status: 400 }
      );
    }

    const toolSlug = toolSegment; // Now toolSlug is guaranteed to be a string

    // Get tool config
    const toolConfig = getToolBySlug(toolSlug);

    // If no matching tool config is found, return 404
    if (!toolConfig) {
      return NextResponse.json(
        { error: `AI tool '${toolSlug}' not found`, code: 'not_found' },
        { status: 404 }
      );
    }

    try {
      // Dynamically import the tool's route handler
      const toolModule = await import(`@/app/(ai)/ai-apps/${toolSlug}/route`);

      // If the module has a POST function, call it with the request
      if (typeof toolModule.POST === 'function') {
        return toolModule.POST(req);
      } else {
        return NextResponse.json(
          {
            error: `API endpoint for '${toolSlug}' does not support POST requests`,
            code: 'method_not_supported',
          },
          { status: 405 }
        );
      }
    } catch (importError) {
      console.error(`Failed to import route handler for tool '${toolSlug}':`, importError);
      return NextResponse.json(
        {
          error: `AI tool '${toolSlug}' implementation not found`,
          code: 'implementation_not_found',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in dynamic AI tool router:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request', code: 'internal_error' },
      { status: 500 }
    );
  }
}
