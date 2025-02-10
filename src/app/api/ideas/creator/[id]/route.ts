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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const creatorId = params.id;
    
    if (!creatorId) {
      return createErrorResponse(
        { message: 'Creator ID is required', code: 'MISSING_CREATOR_ID' },
        400
      );
    }

    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return createErrorResponse(
        { 
          message: 'Database connection failed', 
          code: 'DB_CONNECTION_ERROR',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        503
      );
    }

    try {
      const ideas = await ProductIdea.aggregate([
        { $match: { creatorId } },
        {
          $group: {
            _id: '$groupId',
            groupTitle: { $first: '$groupTitle' },
            ideas: {
              $push: {
                _id: '$_id',
                title: '$title',
                description: '$description',
                shareableId: '$shareableId',
                votes: '$votes',
                views: '$views',
                order: '$order'
              }
            },
            totalViews: { $sum: '$views' },
            createdAt: { $first: '$createdAt' }
          }
        },
        { $sort: { createdAt: -1 } }
      ]).exec();

      return NextResponse.json(ideas, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (queryError) {
      console.error('Query error:', queryError);
      return createErrorResponse(
        { 
          message: 'Failed to fetch ideas', 
          code: 'QUERY_ERROR',
          details: queryError instanceof Error ? queryError.message : String(queryError)
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
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
} 