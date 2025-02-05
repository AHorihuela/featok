import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

type VoteType = 'superLike' | 'up' | 'neutral';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = (await req.json()) as { type: VoteType };

    if (!type || !['superLike', 'up', 'neutral'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid vote type. Must be superLike, up, or neutral.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const idea = await ProductIdea.findOne({ shareableId: params.id });

    if (!idea) {
      return NextResponse.json({ message: 'Idea not found' }, { status: 404 });
    }

    // Increment the appropriate vote counter
    const updateField = `votes.${type}`;
    await ProductIdea.updateOne(
      { shareableId: params.id },
      { $inc: { [updateField]: 1 } }
    );

    // Fetch and return updated idea
    const updatedIdea = await ProductIdea.findOne({ shareableId: params.id });
    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error('Failed to submit vote:', error);
    return NextResponse.json(
      { message: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
