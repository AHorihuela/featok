'use client';

import { useEffect, useState, use } from 'react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MenuButton } from '@/components/ui/menu-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductIdea {
  _id: string;
  title: string;
  description: string;
  votes: {
    up: number;
    neutral: number;
    superLike: number;
  };
  shareableId: string;
  groupId: string;
  order: number;
  createdAt: string;
}

type VoteType = 'superLike' | 'up' | 'neutral';

const SWIPE_THRESHOLD = 100; // minimum distance for a swipe
const SWIPE_VELOCITY = 0.3; // minimum velocity for a swipe

// Add new state for vote confirmation
interface VoteConfirmation {
  type: VoteType;
  idea: ProductIdea;
}

export default function SwipePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<VoteType | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const controls = useAnimation();
  const [voteConfirmation, setVoteConfirmation] = useState<VoteConfirmation | null>(null);
  const [lastVote, setLastVote] = useState<VoteConfirmation | null>(null);
  const [dragIntensity, setDragIntensity] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // Hide instructions after 3 seconds
    if (showInstructions) {
      const timer = setTimeout(() => setShowInstructions(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  useEffect(() => {
    const creatorId = localStorage.getItem('featok_creator_id');
    fetchIdeas(creatorId);
  }, [id]);

  const fetchIdeas = async (creatorId: string | null) => {
    try {
      const response = await fetch(`/api/ideas/group/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      setIdeas(data.sort((a: ProductIdea, b: ProductIdea) => a.order - b.order));
      
      // Check if current user is the creator
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
    if (!voteConfirmation) return;

    try {
      // Revert the vote
      const response = await fetch(
        `/api/ideas/${voteConfirmation.idea.shareableId}/vote/undo`,
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

      // Update the idea in our local state
      setIdeas(
        ideas.map(idea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );

      setVoteConfirmation(null);
    } catch (error) {
      console.error('Undo error:', error);
    }
  };

  const handleDrag = (
    event: PointerEvent | TouchEvent | MouseEvent,
    info: PanInfo
  ) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;

    // Calculate the intensity based on drag distance (0 to 1)
    const maxDragDistance = 150; // Adjust this value to control sensitivity
    let intensity = 0;

    // Determine swipe direction and intensity based on the strongest movement
    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      intensity = Math.min(Math.abs(xOffset) / maxDragDistance, 1);
      if (xOffset > 50) {
        setSwipeDirection('superLike');
      } else if (xOffset < -50) {
        setSwipeDirection('neutral');
      }
    } else if (yOffset < -50) {
      intensity = Math.min(Math.abs(yOffset) / maxDragDistance, 1);
      setSwipeDirection('up');
    } else {
      setSwipeDirection(null);
    }

    setDragIntensity(intensity);
  };

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;
    const velocity = Math.max(
      Math.abs(info.velocity.x),
      Math.abs(info.velocity.y)
    );

    let direction: VoteType | null = null;

    // Determine the primary direction of movement
    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      if (xOffset > SWIPE_THRESHOLD) {
        direction = 'superLike';
      } else if (xOffset < -SWIPE_THRESHOLD) {
        direction = 'neutral';
      }
    } else if (yOffset < -SWIPE_THRESHOLD) {
      direction = 'up';
    }

    if (direction && velocity >= SWIPE_VELOCITY) {
      // Animate the card off screen
      const animationProps = {
        superLike: { x: 1000, y: 0, rotate: 30 },
        up: { x: 0, y: -1000, rotate: 0 },
        neutral: { x: -1000, y: 0, rotate: -30 },
      }[direction];

      await controls.start({
        ...animationProps,
        opacity: 0,
        transition: { duration: 0.5 },
      });

      // Submit the vote
      await handleVote(direction);

      // Reset the card position for the next idea
      await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    } else {
      // Reset the card position if swipe wasn't strong enough
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1 });
    }

    setSwipeDirection(null);
    setDragIntensity(0); // Reset intensity at the end of drag
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Love Card (Right) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
            animate={{
              x: [0, 200, 0],
              rotate: [0, 15, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0,
            }}
          >
            <div className="absolute bottom-4 right-4 text-green-500 text-2xl">❤️</div>
          </motion.div>

          {/* Neat Card (Up) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
            animate={{
              y: [0, -200, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          >
            <div className="absolute bottom-4 right-4 text-yellow-500 text-2xl">😊</div>
          </motion.div>

          {/* Meh Card (Left) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
            animate={{
              x: [0, -200, 0],
              rotate: [0, -15, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
          >
            <div className="absolute bottom-4 right-4 text-red-500 text-2xl">🤷</div>
          </motion.div>

          {/* Static Card (Base) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white/50 rounded-2xl shadow-lg" />
        </div>
      </div>
    );
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
                  ❤️ {idea.votes.superLike} | 😊 {idea.votes.up} | 🤷 {idea.votes.neutral}
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
      className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden"
      style={{
        backgroundColor: swipeDirection === 'superLike' 
          ? `rgba(22, 163, 74, ${dragIntensity * 0.15})`
          : swipeDirection === 'up'
            ? `rgba(234, 179, 8, ${dragIntensity * 0.15})`
            : swipeDirection === 'neutral'
              ? `rgba(239, 68, 68, ${dragIntensity * 0.15})`
              : 'rgb(249, 250, 251)'
      }}
    >
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Vote on Ideas</h1>
          <div className="flex items-center gap-2 text-lg">
            <span className="font-medium text-gray-400">{currentIndex + 1}</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-500">{ideas.length}</span>
          </div>
        </div>

        {/* Menu Button - Only show for creator */}
        {isCreator && <MenuButton groupId={id} />}

        {/* Card Container */}
        <div className="h-[calc(100vh-320px)] relative flex items-center justify-center">
          <motion.div
            drag={!voteConfirmation}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onTouchMove={(e) => {
              // Prevent scrolling while dragging
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
            <motion.div
              key="card"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 touch-none min-h-[420px] flex flex-col"
              style={{ touchAction: 'none' }}
              animate={{
                rotate: swipeDirection === 'superLike' 
                  ? 15 
                  : swipeDirection === 'neutral' 
                    ? -15 
                    : swipeDirection === 'up'
                      ? 0
                      : 0,
                y: swipeDirection === 'up' ? -20 : 0,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <div className="flex-grow">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {currentIdea.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {currentIdea.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <motion.button
                  onClick={() => handleVote('neutral')}
                  className="w-full py-4 px-4 rounded-2xl bg-red-50 text-red-500 font-medium text-lg hover:bg-red-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🤷 Meh
                </motion.button>
                <motion.button
                  onClick={() => handleVote('up')}
                  className="w-full py-4 px-4 rounded-2xl bg-yellow-50 text-yellow-600 font-medium text-lg hover:bg-yellow-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  😊 Neat
                </motion.button>
                <motion.button
                  onClick={() => handleVote('superLike')}
                  className="w-full py-4 px-4 rounded-2xl bg-green-50 text-green-500 font-medium text-lg hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ❤️ Love
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Remove the old navigation links */}
        <div className="mt-10 flex justify-center gap-12">
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {voteConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-6 py-3 flex items-center gap-3"
          >
            <span className="text-2xl">
              {voteConfirmation.type === 'superLike' && '❤️'}
              {voteConfirmation.type === 'up' && '😊'}
              {voteConfirmation.type === 'neutral' && '🤷'}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {voteConfirmation.type === 'superLike' && 'Loved'}
              {voteConfirmation.type === 'up' && 'Neat'}
              {voteConfirmation.type === 'neutral' && 'Meh'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Undo Button */}
      <AnimatePresence>
        {lastVote && (
          <motion.button
            onClick={handleUndo}
            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-full px-6 py-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-blue-500">↩️</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">Undo</span>
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
