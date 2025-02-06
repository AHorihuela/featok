import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';

export async function GET() {
  try {
    await connectDB();
    const collections = await Collection.find().populate('ideas');
    return NextResponse.json(collections);
  } catch (err) {
    console.error('Failed to fetch collections:', err);
    return NextResponse.json(
      { message: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    await connectDB();
    const collection = await Collection.create({ name, description });
    return NextResponse.json(collection);
  } catch (err) {
    console.error('Failed to create collection:', err);
    return NextResponse.json(
      { message: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
