import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { ideas, creatorId } = await req.json();

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

    // Connect to database
    await connectDB();

    // Generate a unique group ID for this set of ideas
    const groupId = nanoid(10);

    // Create all ideas with the same group ID
    const createdIdeas = await Promise.all(
      ideas.map((idea, index) =>
        ProductIdea.create({
          title: idea.title,
          description: idea.description,
          shareableId: nanoid(10),
          groupId,
          creatorId,
          order: index,
        })
      )
    );

    return NextResponse.json({
      message: 'Ideas submitted successfully',
      groupId,
      count: createdIdeas.length,
    });
  } catch (error) {
    console.error('Failed to submit ideas:', error);
    return NextResponse.json(
      { message: 'Failed to submit ideas' },
      { status: 500 }
    );
  }
}
