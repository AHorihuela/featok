import { useState } from 'react';
import React from 'react';
import { ProductIdea, VoteType, VoteConfirmation } from '@/types/ideas';

export function useVoting(ideas: ProductIdea[], setIdeas: React.Dispatch<React.SetStateAction<ProductIdea[]>>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voteConfirmation, setVoteConfirmation] = useState<VoteConfirmation | null>(null);
  const [lastVote, setLastVote] = useState<VoteConfirmation | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (type: VoteType) => {
    if (currentIndex >= ideas.length || isVoting) {
      console.log('Vote blocked: ', { currentIndex, isVoting, totalIdeas: ideas.length });
      return;
    }

    setIsVoting(true);
    const currentIdea = ideas[currentIndex];
    
    try {
      console.log('Submitting vote: ', { type, ideaId: currentIdea.shareableId });
      
      setVoteConfirmation({ type, idea: currentIdea });
      setLastVote({ type, idea: currentIdea });

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
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit vote' }));
        throw new Error(errorData.message || 'Failed to submit vote');
      }

      let updatedIdea: ProductIdea;
      try {
        updatedIdea = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!updatedIdea || !updatedIdea.shareableId) {
        throw new Error('Invalid idea data received from server');
      }

      console.log('Vote recorded: ', { updatedIdea });

      // Update the ideas array with the new vote counts
      setIdeas((prevIdeas: ProductIdea[]): ProductIdea[] => 
        prevIdeas.map((idea: ProductIdea): ProductIdea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );

      // Wait for animations and state updates
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Clear vote confirmation and move to next idea
      setVoteConfirmation(null);
      setCurrentIndex(prev => prev + 1);
      
      console.log('Moving to next idea: ', { newIndex: currentIndex + 1 });
    } catch (error) {
      console.error('Vote error:', error);
      setVoteConfirmation(null);
      setLastVote(null);
    } finally {
      setIsVoting(false);
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

      const updatedIdea = await response.json() as ProductIdea;

      setIdeas((prevIdeas: ProductIdea[]): ProductIdea[] =>
        prevIdeas.map((idea: ProductIdea): ProductIdea =>
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