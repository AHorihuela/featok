import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

interface ErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

function createErrorResponse(error: ErrorResponse, status: number) {
  return NextResponse.json(
    { error },
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return createErrorResponse(
        { message: 'Creator ID is required', code: 'MISSING_ID' },
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

    try {
      // Find all ideas by creator, grouped by groupId
      const ideas = await ProductIdea.find({ creatorId: id })
        .sort({ createdAt: -1 })
        .maxTimeMS(5000); // Add timeout to prevent long-running queries

      if (!ideas || ideas.length === 0) {
        return NextResponse.json([], {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Group ideas by groupId
      const groupedIdeas = ideas.reduce((acc, idea) => {
        const group = acc.find((g: { groupId: string }) => g.groupId === idea.groupId);
        if (group) {
          group.ideas.push({
            title: idea.title,
            description: idea.description,
            votes: idea.votes,
            views: idea.views || 0,
          });
        } else {
          acc.push({
            groupId: idea.groupId,
            groupTitle: idea.groupTitle || 'My Ideas',
            createdAt: idea.createdAt,
            ideas: [
              {
                title: idea.title,
                description: idea.description,
                votes: idea.votes,
                views: idea.views || 0,
              },
            ],
          });
        }
        return acc;
      }, [] as Array<{
        groupId: string;
        groupTitle: string;
        createdAt: Date;
        ideas: Array<{
          title: string;
          description: string;
          votes: {
            superLike: number;
            up: number;
            neutral: number;
          };
          views: number;
        }>;
      }>);

      return NextResponse.json(groupedIdeas, {
        headers: { 'Content-Type': 'application/json' }
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
    console.error('Unexpected error:', error instanceof Error ? error.message : error);
    return createErrorResponse(
      { 
        message: 'An unexpected error occurred', 
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
} 