import { useState, useCallback } from 'react';
import React from 'react';
import { ProductIdea, VoteType, VoteConfirmation } from '@/types/ideas';

// Cache for vote responses
const voteCache = new Map<string, ProductIdea>();

export function useVoting(ideas: ProductIdea[], setIdeas: React.Dispatch<React.SetStateAction<ProductIdea[]>>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voteConfirmation, setVoteConfirmation] = useState<VoteConfirmation | null>(null);
  const [lastVote, setLastVote] = useState<VoteConfirmation | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [retryQueue, setRetryQueue] = useState<Array<{ type: VoteType; ideaId: string }>>([]);

  // Process retry queue
  const processRetryQueue = useCallback(async () => {
    if (retryQueue.length === 0) return;

    const [nextRetry, ...remainingRetries] = retryQueue;
    setRetryQueue(remainingRetries);

    try {
      const response = await fetch(
        `/api/ideas/${nextRetry.ideaId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: nextRetry.type }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to retry vote');
      }

      const updatedIdea = await response.json();
      voteCache.set(updatedIdea.shareableId, updatedIdea);
      
      setIdeas(prevIdeas => 
        prevIdeas.map(idea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );
    } catch (error) {
      console.error('Retry failed:', error);
      // Add back to queue if still failing
      setRetryQueue(prev => [...prev, nextRetry]);
    }
  }, [retryQueue, setIdeas]);

  // Process retry queue when it changes
  React.useEffect(() => {
    if (retryQueue.length > 0) {
      const timeoutId = setTimeout(processRetryQueue, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [retryQueue, processRetryQueue]);

  const handleVote = async (type: VoteType) => {
    if (currentIndex >= ideas.length || isVoting) {
      console.log('Vote blocked: ', { currentIndex, isVoting, totalIdeas: ideas.length });
      return;
    }

    setIsVoting(true);
    const currentIdea = ideas[currentIndex];
    
    try {
      console.log('Submitting vote: ', { type, ideaId: currentIdea.shareableId });
      
      // Optimistically update UI
      setVoteConfirmation({ type, idea: currentIdea });
      setLastVote({ type, idea: currentIdea });

      // Check cache first
      const cachedResponse = voteCache.get(currentIdea.shareableId);
      if (cachedResponse) {
        setIdeas(prevIdeas => 
          prevIdeas.map(idea =>
            idea.shareableId === cachedResponse.shareableId ? cachedResponse : idea
          )
        );
        
        // Move to next idea after animation
        await new Promise(resolve => setTimeout(resolve, 800));
        setVoteConfirmation(null);
        setCurrentIndex(prev => prev + 1);
        setIsVoting(false);
        return;
      }

      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `/api/ideas/${currentIdea.shareableId}/vote`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to submit vote' }));
          throw new Error(errorData.message || 'Failed to submit vote');
        }

        const updatedIdea = await response.json();
        
        // Update cache
        voteCache.set(updatedIdea.shareableId, updatedIdea);

        // Update state
        setIdeas(prevIdeas => 
          prevIdeas.map(idea =>
            idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
          )
        );

        console.log('Vote recorded: ', { updatedIdea });
      } catch (error) {
        console.error('Vote error:', error);
        // Add to retry queue
        setRetryQueue(prev => [...prev, { type, ideaId: currentIdea.shareableId }]);
      }

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
      
      // Update cache
      voteCache.set(updatedIdea.shareableId, updatedIdea);

      setIdeas(prevIdeas => 
        prevIdeas.map(idea =>
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
    isVoting,
    hasRetries: retryQueue.length > 0,
  };
} 