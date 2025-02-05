import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';

export async function GET() {
  try {
    await connectDB();
    const collections = await Collection.find({}).sort({ createdAt: -1 });
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    await connectDB();
    const collection = await Collection.create({ name });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
