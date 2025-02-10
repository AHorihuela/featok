import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function POST(request: Request) {
  try {
    // Extract ID from URL
    const segments = request.url.split('/');
    const id = segments[segments.indexOf('ideas') + 1];
    
    if (!id) {
      return NextResponse.json(
        { message: 'Missing idea ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const idea = await ProductIdea.findOneAndUpdate(
      { shareableId: id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!idea) {
      return NextResponse.json(
        { message: 'Idea not found' },
        { status: 404 }
      );
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