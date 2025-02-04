import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Idea from '@/models/Idea';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const { userId, vote } = await request.json();
    await connectDB();

    const idea = await Idea.findById(id);
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Get the user's previous vote
    const previousVote = idea.userVotes.get(userId) as 'up' | 'down' | undefined;

    // Remove previous vote if it exists
    if (previousVote) {
      idea.votes[previousVote]--;
      idea.userVotes.delete(userId);
    }

    // Add new vote unless it's a removal
    if (vote !== 'remove') {
      idea.votes[vote]++;
      idea.userVotes.set(userId, vote);
    }

    await idea.save();
    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to submit vote:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
} 