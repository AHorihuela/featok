import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

type VoteType = 'superLike' | 'up' | 'neutral';

export async function POST(request: Request) {
  try {
    // Extract ID from URL
    const segments = request.url.split('/');
    const id = segments[segments.indexOf('ideas') + 1];
    
    if (!id) {
      console.error('Invalid URL structure, no ID found:', request.url);
      return NextResponse.json(
        { message: 'Invalid request: missing idea ID' },
        { status: 400 }
      );
    }

    // Parse request body
    let type: VoteType;
    try {
      const body = await request.json();
      type = body.type;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!type || !['superLike', 'up', 'neutral'].includes(type)) {
      console.error('Invalid vote type received:', type);
      return NextResponse.json(
        { message: 'Invalid vote type. Must be superLike, up, or neutral.' },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find the idea
    let idea;
    try {
      idea = await ProductIdea.findOne({ shareableId: id });
    } catch (findError) {
      console.error('Error finding idea:', findError);
      return NextResponse.json(
        { message: 'Failed to find idea' },
        { status: 500 }
      );
    }

    if (!idea) {
      console.error('No idea found with ID:', id);
      return NextResponse.json(
        { message: 'Idea not found' },
        { status: 404 }
      );
    }

    // Update vote count
    try {
      const updateField = `votes.${type}`;
      await ProductIdea.updateOne(
        { shareableId: id },
        { $inc: { [updateField]: 1 } }
      );
    } catch (updateError) {
      console.error('Failed to update vote count:', updateError);
      return NextResponse.json(
        { message: 'Failed to update vote' },
        { status: 500 }
      );
    }

    // Fetch updated idea
    try {
      const updatedIdea = await ProductIdea.findOne({ shareableId: id });
      if (!updatedIdea) {
        throw new Error('Updated idea not found');
      }
      return NextResponse.json(updatedIdea);
    } catch (fetchError) {
      console.error('Failed to fetch updated idea:', fetchError);
      return NextResponse.json(
        { message: 'Failed to fetch updated idea' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in vote handler:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
