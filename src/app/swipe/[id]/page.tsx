'use client';

import { useEffect, useState, use } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AppMenu } from '@/components/ui/app-menu';
import { IdeaCard } from '@/components/ui/idea-card';
import { useVoting } from '@/hooks/useVoting';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { ProductIdea } from '@/types/ideas';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { VoteToast } from '@/components/ui/vote-toast';
import { UndoButton } from '@/components/ui/undo-button';
import { SwipeInstructions } from '@/components/ui/swipe-instructions';

interface PageProps {
  params: Promise<{ id: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const BATCH_SIZE = 5; // Number of ideas to load at a time

export default function SwipePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const controls = useAnimation();
  const [showInstructions, setShowInstructions] = useState(true);
  const [buttonVoteType, setButtonVoteType] = useState<'superLike' | 'up' | 'neutral' | null>(null);

  const {
    currentIndex,
    voteConfirmation,
    lastVote,
    handleVote,
    handleUndo,
    isVoting,
    hasRetries,
  } = useVoting(ideas, setIdeas);

  // Load more ideas when we're getting close to the end
  useEffect(() => {
    if (currentIndex >= ideas.length - 2 && hasMore && !isLoadingMore) {
      loadMoreIdeas();
    }
  }, [currentIndex, ideas.length, hasMore, isLoadingMore]);

  const loadMoreIdeas = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/ideas/group/${id}?offset=${offset}&limit=${BATCH_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch more ideas');
      }
      const data = await response.json();
      
      if (!data.ideas) {
        throw new Error('Invalid response format');
      }

      setHasMore(data.pagination.hasMore);
      setIdeas(prev => [...prev, ...shuffleArray(data.ideas)]);
      setOffset(prev => prev + data.ideas.length);
    } catch (error) {
      console.error('Failed to load more ideas:', error);
      setError(error instanceof Error ? error.message : 'Failed to load ideas');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const {
    swipeDirection,
    dragIntensity,
    handleDrag,
    handleDragEnd,
  } = useSwipeGesture(controls, async (type) => {
    await handleVote(type);
    setButtonVoteType(null);
  });

  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => setShowInstructions(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  useEffect(() => {
    const creatorId = localStorage.getItem('featok_creator_id');
    fetchInitialIdeas(creatorId);
  }, [id]);

  const fetchInitialIdeas = async (creatorId: string | null) => {
    try {
      const response = await fetch(`/api/ideas/group/${id}?offset=0&limit=${BATCH_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      
      if (!data.ideas) {
        throw new Error('Invalid response format');
      }
      
      setHasMore(data.pagination.hasMore);
      setIdeas(shuffleArray(data.ideas));
      setOffset(data.ideas.length);
      
      if (creatorId && data.ideas.length > 0 && data.ideas[0].creatorId === creatorId) {
        setIsCreator(true);
      }
    } catch (error) {
      setError('Failed to load ideas. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to track views
  const trackView = async (ideaId: string) => {
    try {
      await fetch(`/api/ideas/${ideaId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // Add effect to track view when currentIndex changes
  useEffect(() => {
    if (ideas[currentIndex]) {
      trackView(ideas[currentIndex].shareableId);
    }
  }, [currentIndex, ideas]);

  const getBackgroundColor = () => {
    if (swipeDirection === 'superLike' || buttonVoteType === 'superLike') {
      return `rgba(22, 163, 74, ${dragIntensity * 0.15})`;
    }
    if (swipeDirection === 'up' || buttonVoteType === 'up') {
      return `rgba(234, 179, 8, ${dragIntensity * 0.15})`;
    }
    if (swipeDirection === 'neutral' || buttonVoteType === 'neutral') {
      return `rgba(239, 68, 68, ${dragIntensity * 0.15})`;
    }
    return 'rgb(249, 250, 251)';
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error || ideas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'No ideas found'}</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">All Done! 🎉</h1>
          <p className="text-gray-600 mb-8">
            You&apos;ve voted on all the ideas in this group.
          </p>
          
          {isCreator && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => router.push(`/edit/${id}`)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit List
              </button>
              <button
                onClick={() => router.push('/my-lists')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Manage Lists
              </button>
            </div>
          )}
          
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Final Results:</h2>
            {ideas.map(idea => (
              <div
                key={idea._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
              >
                <h3 className="font-medium">{idea.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  ❤️ {idea.votes.superLike} | 👍 {idea.votes.up} | 🤷 {idea.votes.neutral}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentIdea = ideas[currentIndex];

  return (
    <main 
      className="min-h-screen overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: getBackgroundColor(),
      }}
    >
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Vote on Ideas
          </h1>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-400">{currentIndex + 1}</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-500">
              {hasMore ? '∞' : ideas.length}
            </span>
            {hasRetries && (
              <span className="text-yellow-500 text-sm ml-2">
                Retrying votes...
              </span>
            )}
          </div>
        </div>

        <SwipeInstructions show={showInstructions} />

        <div className="h-[calc(100vh-320px)] relative flex items-center justify-center mt-8">
          {isLoadingMore && currentIndex === ideas.length - 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-3xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <motion.div
            drag={!voteConfirmation && !isVoting}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onTouchMove={(e) => {
              if (e.currentTarget.style.touchAction !== 'none') {
                e.currentTarget.style.touchAction = 'none';
              }
            }}
            onTouchStart={() => {
              setShowInstructions(false);
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.touchAction = 'auto';
            }}
            animate={controls}
            className="relative touch-none w-full"
            style={{ 
              transformOrigin: "bottom center",
              transform: `perspective(1000px)`,
            }}
          >
            <IdeaCard
              idea={currentIdea}
              swipeDirection={swipeDirection}
              onVote={async (type) => {
                setButtonVoteType(type);
                await handleVote(type);
                setButtonVoteType(null);
              }}
              isVoting={isVoting}
            />
          </motion.div>
        </div>
      </div>

      <AppMenu groupId={id} />
      <VoteToast voteConfirmation={voteConfirmation} />
      <UndoButton lastVote={lastVote} onUndo={handleUndo} />
    </main>
  );
}
