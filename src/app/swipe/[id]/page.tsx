'use client';

import { useEffect, useState, use } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

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

export default function SwipePage({ params }: PageProps) {
  const { id } = use(params);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<VoteType | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    fetchIdeas();
  }, [id]);

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`/api/ideas/group/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      setIdeas(
        data.sort((a: ProductIdea, b: ProductIdea) => a.order - b.order)
      );
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

      // Update the idea in our local state
      setIdeas(
        ideas.map(idea =>
          idea.shareableId === updatedIdea.shareableId ? updatedIdea : idea
        )
      );

      // Move to next idea
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Vote error:', error);
      throw error;
    }
  };

  const handleDrag = (
    event: PointerEvent | TouchEvent | MouseEvent,
    info: PanInfo
  ) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;

    // Determine swipe direction based on the strongest movement
    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      if (xOffset > 50) {
        setSwipeDirection('superLike');
      } else if (xOffset < -50) {
        setSwipeDirection('neutral');
      }
    } else if (yOffset < -50) {
      setSwipeDirection('up');
    } else {
      setSwipeDirection(null);
    }
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">All Done! 🎉</h1>
          <p className="text-gray-600">
            You&apos;ve voted on all the ideas in this group.
          </p>
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Final Results:</h2>
            {ideas.map(idea => (
              <div
                key={idea._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
              >
                <h3 className="font-medium">{idea.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  🔥 {idea.votes.superLike} | 👍 {idea.votes.up} | 😐{' '}
                  {idea.votes.neutral}
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
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vote on Ideas</h1>
          <p className="text-gray-600">
            Idea {currentIndex + 1} of {ideas.length}
          </p>
        </div>

        <div className="relative h-[60vh] flex items-center justify-center">
          {/* Swipe Direction Indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className={`absolute inset-x-0 top-0 h-1/3 flex items-center justify-center transition-opacity ${
                swipeDirection === 'up' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
                ✨ Neat
              </div>
            </div>
            <div
              className={`absolute right-0 inset-y-0 w-1/3 flex items-center justify-center transition-opacity ${
                swipeDirection === 'superLike' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-pink-500 text-white px-6 py-3 rounded-lg shadow-lg">
                🔥 Sick!
              </div>
            </div>
            <div
              className={`absolute left-0 inset-y-0 w-1/3 flex items-center justify-center transition-opacity ${
                swipeDirection === 'neutral' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-lg">
                😐 Meh
              </div>
            </div>
          </div>

          <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={controls}
            className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 transition-colors ${
                swipeDirection === 'superLike'
                  ? 'bg-pink-50 dark:bg-pink-900'
                  : swipeDirection === 'up'
                    ? 'bg-green-50 dark:bg-green-900'
                    : swipeDirection === 'neutral'
                      ? 'bg-gray-50 dark:bg-gray-900'
                      : ''
              }`}
            >
              <h2 className="text-2xl font-bold">{currentIdea.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentIdea.description}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 text-center text-sm">
                <div className="text-gray-500">👈 Meh</div>
                <div className="text-gray-500">⬆️ Neat</div>
                <div className="text-gray-500">Sick! 👉</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vote Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => handleVote('neutral')}
            className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            😐
          </button>
          <button
            onClick={() => handleVote('up')}
            className="p-4 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 transition-colors"
          >
            ✨
          </button>
          <button
            onClick={() => handleVote('superLike')}
            className="p-4 rounded-full bg-pink-100 hover:bg-pink-200 dark:bg-pink-800 dark:hover:bg-pink-700 transition-colors"
          >
            🔥
          </button>
        </div>

        <div className="mt-4 text-center text-gray-600">
          <p className="mt-2">
            Current votes: 🔥 Sick! {currentIdea.votes.superLike} | ✨ Neat{' '}
            {currentIdea.votes.up} | 😐 Meh {currentIdea.votes.neutral}
          </p>
        </div>
      </div>
    </main>
  );
}
