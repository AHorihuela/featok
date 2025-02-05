import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Find all ideas by creator, grouped by groupId
    const ideas = await ProductIdea.find({ creatorId: params.id }).sort({
      createdAt: -1,
    });

    if (!ideas || ideas.length === 0) {
      return NextResponse.json([]);
    }

    // Group ideas by groupId
    const groupedIdeas = ideas.reduce((acc, idea) => {
      const group = acc.find((g: { groupId: string }) => g.groupId === idea.groupId);
      if (group) {
        group.ideas.push({
          title: idea.title,
          description: idea.description,
          votes: idea.votes,
        });
      } else {
        acc.push({
          groupId: idea.groupId,
          createdAt: idea.createdAt,
          ideas: [
            {
              title: idea.title,
              description: idea.description,
              votes: idea.votes,
            },
          ],
        });
      }
      return acc;
    }, [] as Array<{
      groupId: string;
      createdAt: Date;
      ideas: Array<{
        title: string;
        description: string;
        votes: {
          superLike: number;
          up: number;
          neutral: number;
        };
      }>;
    }>);

    return NextResponse.json(groupedIdeas);
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json(
      { message: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
} 