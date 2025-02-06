import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();

    const idea = await ProductIdea.findOne({ shareableId: id });

    if (!idea) {
      return NextResponse.json({ message: 'Idea not found' }, { status: 404 });
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
