import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import Idea from '@/models/Idea';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await connectDB();
    const collection = await Collection.findById(id).populate('ideas');
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection.ideas);
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const { text } = await request.json();
    await connectDB();

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const idea = await Idea.create({
      text,
      collection: id,
      votes: { up: 0, down: 0 },
      userVotes: new Map()
    });

    collection.ideas.push(idea._id);
    await collection.save();

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to add idea:', error);
    return NextResponse.json({ error: 'Failed to add idea' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await connectDB();

    const collection = await Collection.findById(id).populate('ideas');
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Delete all ideas associated with this collection
    await Idea.deleteMany({ collection: id });

    // Clear the ideas array in the collection
    collection.ideas = [];
    await collection.save();

    return NextResponse.json({ message: 'All ideas deleted successfully' });
  } catch (error) {
    console.error('Failed to delete ideas:', error);
    return NextResponse.json({ error: 'Failed to delete ideas' }, { status: 500 });
  }
} 