import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

type VoteType = 'superLike' | 'up' | 'neutral';

export async function POST(request: Request) {
  try {
    const id = request.url.split('/').pop();
    const { type } = (await request.json()) as { type: VoteType };

    if (!type || !['superLike', 'up', 'neutral'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid vote type. Must be superLike, up, or neutral.' },
        { status: 400 }
      );
    }

    await connectDB();

    const idea = await ProductIdea.findOne({ shareableId: id });

    if (!idea) {
      return NextResponse.json({ message: 'Idea not found' }, { status: 404 });
    }

    // Increment the appropriate vote counter
    const updateField = `votes.${type}`;
    await ProductIdea.updateOne(
      { shareableId: id },
      { $inc: { [updateField]: 1 } }
    );

    // Fetch and return updated idea
    const updatedIdea = await ProductIdea.findOne({ shareableId: id });
    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error('Failed to submit vote:', error);
    return NextResponse.json(
      { message: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
