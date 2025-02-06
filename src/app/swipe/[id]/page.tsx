'use client';

import { useEffect, useState, use } from 'react';
import { useAnimation } from 'framer-motion';
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
import { CompletionScreen } from '@/components/ui/completion-screen';
import { motion, AnimatePresence } from 'framer-motion';

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

const BATCH_SIZE = 50; // Increased to load more ideas at once

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
  const [groupTitle, setGroupTitle] = useState<string>('Cast your vote');
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
      setIdeas(prev => [...prev, ...shuffleArray<ProductIdea>(data.ideas)]);
      setOffset(prev => prev + data.ideas.length);
      setGroupTitle(data.groupTitle || 'Vote on Ideas');
      
      if (data.ideas.length > 0 && data.ideas[0].creatorId === localStorage.getItem('featok_creator_id')) {
        setIsCreator(true);
      }
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
      setGroupTitle(data.groupTitle || 'Vote on Ideas');
      
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
      <CompletionScreen 
        ideas={ideas}
        isCreator={isCreator}
        onEdit={() => router.push(`/edit/${id}`)}
        onManage={() => router.push('/my-lists')}
      />
    );
  }

  const currentIdea = ideas[currentIndex];

  return (
    <motion.main 
      className="min-h-screen overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: getBackgroundColor(),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-lg mx-auto px-6 py-8">
        <motion.div 
          className="flex justify-between items-center mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {groupTitle}
          </motion.h1>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="font-medium text-gray-400">{currentIndex + 1}</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-500">
              {ideas.length}
            </span>
            {hasRetries && (
              <motion.span 
                className="text-yellow-500 text-sm ml-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                Retrying votes...
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showInstructions && <SwipeInstructions show={showInstructions} />}
        </AnimatePresence>

        <motion.div 
          className="h-[calc(100vh-320px)] relative flex items-center justify-center mt-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {isLoadingMore && currentIndex === ideas.length - 1 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
          
          <IdeaCard
            idea={currentIdea}
            swipeDirection={swipeDirection}
            onVote={async (type) => {
              setButtonVoteType(type);
              await handleVote(type);
              setButtonVoteType(null);
            }}
            isVoting={isVoting}
            remainingCount={ideas.length - currentIndex - 1}
            dragProps={{
              drag: !voteConfirmation && !isVoting,
              dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
              dragElastic: 0.7,
              onDrag: handleDrag,
              onDragEnd: handleDragEnd,
              whileDrag: {
                cursor: "grabbing",
                scale: 1.02,
                transformOrigin: "center center",
                perspective: 1000,
              },
              whileHover: {
                scale: 1.02,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }
              },
              style: { 
                transformOrigin: "center center",
                transform: `perspective(1000px)`,
                cursor: "grab",
                touchAction: "none"
              },
              animate: controls,
              onHoverStart: () => setShowInstructions(false),
            }}
          />
        </motion.div>
      </div>

      <AppMenu groupId={id} />
      <VoteToast voteConfirmation={voteConfirmation} />
      <UndoButton lastVote={lastVote} onUndo={handleUndo} />
    </motion.main>
  );
}
