import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const idea = await ProductIdea.findOne({ shareableId: params.id });
    
    if (!idea) {
      return NextResponse.json(
        { message: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to fetch idea:', error);
    return NextResponse.json(
      { message: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
} 