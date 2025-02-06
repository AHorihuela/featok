import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { IIdea } from '@/models/Idea';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();
    const collection = await Collection.findById(id).populate<{
      ideas: IIdea[];
    }>('ideas');
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const stats = {
      up: 0,
      down: 0,
    };

    collection.ideas.forEach((idea: IIdea) => {
      stats.up += idea.votes.up;
      stats.down += idea.votes.down;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
