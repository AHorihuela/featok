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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Verify creator
    const { creatorId } = await req.json();
    const ideas = await ProductIdea.find({ groupId: params.id });

    if (!ideas || ideas.length === 0) {
      return NextResponse.json(
        { message: 'No ideas found in this group' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (ideas[0].creatorId !== creatorId) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this group' },
        { status: 403 }
      );
    }

    // Delete all ideas in the group
    await ProductIdea.deleteMany({ groupId: params.id });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Failed to delete group:', error);
    return NextResponse.json(
      { message: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
