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
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function SwipePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const controls = useAnimation();
  const [showInstructions, setShowInstructions] = useState(true);
  const [buttonVoteType, setButtonVoteType] = useState<'superLike' | 'up' | 'neutral' | null>(null);

  const {
    currentIndex,
    voteConfirmation,
    lastVote,
    handleVote,
    handleUndo,
  } = useVoting(ideas, setIdeas);

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
    fetchIdeas(creatorId);
  }, [id]);

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

  const fetchIdeas = async (creatorId: string | null) => {
    try {
      const response = await fetch(`/api/ideas/group/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      
      // Randomize the order of ideas before setting them
      setIdeas(shuffleArray(data));
      
      if (creatorId && data.length > 0 && data[0].creatorId === creatorId) {
        setIsCreator(true);
      }
    } catch (error) {
      setError('Failed to load ideas. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-2 text-lg">
            <span className="font-medium text-gray-400">{currentIndex + 1}</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-500">{ideas.length}</span>
          </div>
        </div>

        <SwipeInstructions show={showInstructions} />

        <div className="h-[calc(100vh-320px)] relative flex items-center justify-center mt-8">
          <motion.div
            drag={!voteConfirmation}
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
