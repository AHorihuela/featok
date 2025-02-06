import { motion, useAnimation } from 'framer-motion';
import { ProductIdea, VoteType } from '@/types/ideas';
import { useState } from 'react';
import { ShineBorder } from './shine-border';

interface IdeaCardProps {
  idea: ProductIdea;
  swipeDirection: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
}

export function IdeaCard({ idea, swipeDirection, onVote }: IdeaCardProps) {
  const controls = useAnimation();
  const [buttonVoteType, setButtonVoteType] = useState<VoteType | null>(null);

  const handleButtonVote = async (type: VoteType) => {
    // Set the vote type to trigger background animation
    setButtonVoteType(type);

    // Define animation properties based on vote type
    const animationProps = {
      superLike: { x: 1000, y: 0, rotate: 30, opacity: 0 },
      up: { x: 0, y: -1000, rotate: 0, opacity: 0 },
      neutral: { x: -1000, y: 0, rotate: -30, opacity: 0 },
    }[type];

    // Wait a bit to show the background color
    await new Promise(resolve => setTimeout(resolve, 200));

    // Animate the card
    await controls.start({
      ...animationProps,
      transition: { duration: 0.5 },
    });

    // Submit the vote
    await onVote(type);

    // Reset the card position and background
    await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    setButtonVoteType(null);
  };

  // Calculate background color based on vote type and intensity
  const getBorderColor = () => {
    const type = buttonVoteType || swipeDirection;
    const intensity = buttonVoteType ? 0.15 : 0; // Full intensity for button clicks

    if (type === 'superLike') {
      return `rgba(22, 163, 74, ${intensity})`;
    } else if (type === 'up') {
      return `rgba(234, 179, 8, ${intensity})`;
    } else if (type === 'neutral') {
      return `rgba(239, 68, 68, ${intensity})`;
    }
    return '#e2e8f0';
  };

  return (
    <motion.div
      key="card"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={controls}
      className="w-full max-w-md mx-auto"
    >
      <ShineBorder
        className="min-h-[420px] w-full bg-white dark:bg-gray-800 p-8 flex flex-col"
        color={getBorderColor()}
        borderRadius={32}
        borderWidth={1}
        duration={4}
      >
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {idea.title}
          </h2>
          {idea.description && (
            <p className="text-gray-500 dark:text-gray-400 text-xl">
              {idea.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.button
            onClick={() => handleButtonVote('neutral')}
            className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-3xl bg-red-50/50 text-red-500 font-medium hover:bg-red-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">🤷</span>
            <span>Meh</span>
          </motion.button>
          <motion.button
            onClick={() => handleButtonVote('up')}
            className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-3xl bg-yellow-50/50 text-yellow-600 font-medium hover:bg-yellow-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">👍</span>
            <span>Neat</span>
          </motion.button>
          <motion.button
            onClick={() => handleButtonVote('superLike')}
            className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-3xl bg-green-50/50 text-green-500 font-medium hover:bg-green-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">❤️</span>
            <span>Love</span>
          </motion.button>
        </div>
      </ShineBorder>
    </motion.div>
  );
} 