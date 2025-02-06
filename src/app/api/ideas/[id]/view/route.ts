import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const idea = await ProductIdea.findOneAndUpdate(
      { shareableId: params.id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!idea) {
      return NextResponse.json({ message: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({ views: idea.views });
  } catch (error) {
    console.error('Failed to track view:', error);
    return NextResponse.json(
      { message: 'Failed to track view' },
      { status: 500 }
    );
  }
} 