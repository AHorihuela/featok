import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

interface ErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

const TIMEOUT = 10000; // 10 seconds

function createErrorResponse(error: ErrorResponse, status: number) {
  return NextResponse.json(
    { error },
    { status }
  );
}

function isValidId(id: string | undefined): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 50;
}

export async function GET(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!isValidId(id)) {
      return createErrorResponse(
        { message: 'Invalid group ID', code: 'INVALID_ID' },
        400
      );
    }

    if (isNaN(offset) || offset < 0 || isNaN(limit) || limit < 1) {
      return createErrorResponse(
        { message: 'Invalid pagination parameters', code: 'INVALID_PARAMS' },
        400
      );
    }

    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error instanceof Error ? error.message : error);
      return createErrorResponse(
        { 
          message: 'Database connection failed', 
          code: 'DB_CONNECTION_ERROR',
          details: error instanceof Error ? error.message : String(error)
        },
        503
      );
    }

    let ideas;
    try {
      ideas = await ProductIdea.find({ groupId: id })
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit)
        .maxTimeMS(5000);

      // Get total count for pagination info
      const total = await ProductIdea.countDocuments({ groupId: id });

      if (!ideas || ideas.length === 0) {
        if (offset === 0) {
          return createErrorResponse(
            { message: 'No ideas found in this group', code: 'NOT_FOUND' },
            404
          );
        } else {
          // If we're past the first page and no results, return empty array
          return NextResponse.json({
            ideas: [],
            pagination: {
              offset,
              limit,
              total,
              hasMore: false
            }
          });
        }
      }

      return NextResponse.json({
        ideas,
        pagination: {
          offset,
          limit,
          total,
          hasMore: offset + ideas.length < total
        }
      });
    } catch (error) {
      console.error('Query error:', error instanceof Error ? error.message : error);
      return createErrorResponse(
        { 
          message: 'Failed to fetch ideas', 
          code: 'QUERY_ERROR',
          details: error instanceof Error ? error.message : String(error)
        },
        500
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return createErrorResponse(
      { 
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined
      },
      500
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function PUT(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const id = request.url.split('/').pop();
    
    if (!isValidId(id)) {
      return createErrorResponse(
        { message: 'Invalid group ID', code: 'INVALID_ID' },
        400
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        { message: 'Invalid request body', code: 'INVALID_JSON' },
        400
      );
    }

    const { ideas, creatorId } = body;

    if (!Array.isArray(ideas) || !ideas.length || !creatorId) {
      return createErrorResponse(
        { message: 'Invalid request data', code: 'INVALID_DATA' },
        400
      );
    }

    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error instanceof Error ? error.message : error);
      return createErrorResponse(
        { 
          message: 'Database connection failed', 
          code: 'DB_CONNECTION_ERROR',
          details: error instanceof Error ? error.message : String(error)
        },
        503
      );
    }

    // Verify creator
    let existingIdeas;
    try {
      existingIdeas = await ProductIdea.find({ groupId: id }).maxTimeMS(5000);
    } catch (error) {
      console.error('Query error:', error instanceof Error ? error.message : error);
      return createErrorResponse(
        { 
          message: 'Failed to verify ownership', 
          code: 'QUERY_ERROR',
          details: error instanceof Error ? error.message : String(error)
        },
        500
      );
    }

    if (!existingIdeas?.length) {
      return createErrorResponse(
        { message: 'Group not found', code: 'NOT_FOUND' },
        404
      );
    }

    if (existingIdeas[0].creatorId !== creatorId) {
      return createErrorResponse(
        { message: 'Unauthorized to update this group', code: 'UNAUTHORIZED' },
        403
      );
    }

    try {
      await ProductIdea.deleteMany({ groupId: id });
      
      const updatedIdeas = await Promise.all(
        ideas.map((idea: { title: string; description: string }, index: number) =>
          ProductIdea.create({
            title: idea.title.trim(),
            description: idea.description.trim(),
            shareableId: existingIdeas[index]?.shareableId || `${id}_${index}`,
            groupId: id,
            creatorId,
            order: index,
            votes: { superLike: 0, up: 0, neutral: 0 },
            views: 0
          })
        )
      );

      return NextResponse.json({
        message: 'Ideas updated successfully',
        ideas: updatedIdeas
      });
    } catch (error) {
      console.error('Update error:', error instanceof Error ? error.message : error);
      return createErrorResponse(
        { 
          message: 'Failed to update ideas', 
          code: 'UPDATE_ERROR',
          details: error instanceof Error ? error.message : String(error)
        },
        500
      );
    }
  } catch (error) {
    return createErrorResponse(
      { 
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined
      },
      500
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();

    // Verify creator
    const { creatorId } = await request.json();
    const ideas = await ProductIdea.find({ groupId: id });

    if (!ideas || ideas.length === 0) {
      return NextResponse.json(
        { message: 'No ideas found in this group' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (ideas[0].creatorId !== creatorId) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this group' },
        { status: 403 }
      );
    }

    // Delete all ideas in the group
    await ProductIdea.deleteMany({ groupId: id });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Failed to delete group:', error);
    return NextResponse.json(
      { message: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
