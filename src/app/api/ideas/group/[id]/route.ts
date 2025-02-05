import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const ideas = await ProductIdea.find({ groupId: params.id });

    if (!ideas || ideas.length === 0) {
      return NextResponse.json(
        { message: 'No ideas found in this group' },
        { status: 404 }
      );
    }

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json(
      { message: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
