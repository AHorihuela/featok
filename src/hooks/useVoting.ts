import { useState } from 'react';
import { ProductIdea, VoteType, VoteConfirmation } from '@/types/ideas';

export function useVoting(ideas: ProductIdea[], setIdeas: (ideas: ProductIdea[]) => void) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voteConfirmation, setVoteConfirmation] = useState<VoteConfirmation | null>(null);
  const [lastVote, setLastVote] = useState<VoteConfirmation | null>(null);

  const handleVote = async (type: VoteType) => {
    if (currentIndex >= ideas.length) return;

    const currentIdea = ideas[currentIndex];
    setVoteConfirmation({ type, idea: currentIdea });
    setLastVote({ type, idea: currentIdea });

    try {
      const response = await fetch(
        `/api/ideas/${currentIdea.shareableId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const updatedIdea = await response.json();

      setIdeas(
        ideas.map(idea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );

      setTimeout(() => {
        setVoteConfirmation(null);
        setCurrentIndex(prev => prev + 1);
      }, 800);
    } catch (error) {
      console.error('Vote error:', error);
      setVoteConfirmation(null);
      setLastVote(null);
      throw error;
    }
  };

  const handleUndo = async () => {
    if (!lastVote) return;

    try {
      const response = await fetch(
        `/api/ideas/${lastVote.idea.shareableId}/vote/undo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to undo vote');
      }

      const updatedIdea = await response.json();

      setIdeas(
        ideas.map(idea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );

      setVoteConfirmation(null);
      setLastVote(null);
      setCurrentIndex(prev => prev - 1);
    } catch (error) {
      console.error('Undo error:', error);
    }
  };

  return {
    currentIndex,
    voteConfirmation,
    lastVote,
    handleVote,
    handleUndo,
  };
} 