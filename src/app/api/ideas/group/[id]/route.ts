import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();

    const ideas = await ProductIdea.find({ groupId: id });

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

export async function PUT(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();

    const { ideas, creatorId } = await request.json();
    
    // Verify creator
    const existingIdeas = await ProductIdea.find({ groupId: id });
    if (!existingIdeas || existingIdeas.length === 0) {
      return NextResponse.json(
        { message: 'No ideas found in this group' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (existingIdeas[0].creatorId !== creatorId) {
      return NextResponse.json(
        { message: 'Unauthorized to update this group' },
        { status: 403 }
      );
    }

    // Delete existing ideas
    await ProductIdea.deleteMany({ groupId: id });

    // Create new ideas with the same group ID
    const updatedIdeas = await Promise.all(
      ideas.map((idea: { title: string; description: string }, index: number) =>
        ProductIdea.create({
          title: idea.title,
          description: idea.description,
          shareableId: existingIdeas[index]?.shareableId || `${id}_${index}`,
          groupId: id,
          creatorId,
          order: index,
          votes: { superLike: 0, up: 0, neutral: 0 },
          views: 0
        })
      )
    );

    return NextResponse.json({
      message: 'Ideas updated successfully',
      ideas: updatedIdeas
    });
  } catch (error) {
    console.error('Failed to update ideas:', error);
    return NextResponse.json(
      { message: 'Failed to update ideas' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    await connectDB();

    // Verify creator
    const { creatorId } = await request.json();
    const ideas = await ProductIdea.find({ groupId: id });

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
    await ProductIdea.deleteMany({ groupId: id });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Failed to delete group:', error);
    return NextResponse.json(
      { message: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
