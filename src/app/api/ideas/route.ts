import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    let ideas, creatorId;
    
    try {
      const body = await req.json();
      ideas = body.ideas;
      creatorId = body.creatorId;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate input
    if (!Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json(
        { message: 'At least one idea is required' },
        { status: 400 }
      );
    }

    if (!creatorId) {
      return NextResponse.json(
        { message: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Validate each idea
    for (const idea of ideas) {
      if (!idea.title || !idea.description) {
        return NextResponse.json(
          { message: 'Title and description are required for each idea' },
          { status: 400 }
        );
      }
    }

    try {
      // Connect to database
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Generate a unique group ID for this set of ideas
    const groupId = nanoid(10);

    try {
      // Create all ideas with the same group ID
      const createdIdeas = await Promise.all(
        ideas.map(async (idea, index) => {
          try {
            return await ProductIdea.create({
              title: idea.title.trim(),
              description: idea.description.trim(),
              shareableId: nanoid(10),
              groupId,
              creatorId,
              order: index,
              votes: { superLike: 0, up: 0, neutral: 0 },
              views: 0
            });
          } catch (createError) {
            console.error(`Failed to create idea ${index}:`, createError);
            throw new Error(`Failed to create idea ${index}: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          }
        })
      );

      return NextResponse.json({
        message: 'Ideas submitted successfully',
        groupId,
        count: createdIdeas.length,
      });
    } catch (dbError) {
      console.error('Failed to create ideas:', dbError);
      return NextResponse.json(
        { message: 'Failed to save ideas to database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in ideas creation:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
