import { motion, useAnimation, MotionProps } from 'framer-motion';
import { ProductIdea, VoteType } from '@/types/ideas';

interface IdeaCardProps {
  idea: ProductIdea;
  swipeDirection: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
  isVoting?: boolean;
  remainingCount?: number;
  dragProps?: MotionProps;
}

export function IdeaCard({ 
  idea, 
  swipeDirection, 
  onVote, 
  isVoting = false, 
  remainingCount = 0,
  dragProps 
}: IdeaCardProps) {
  const controls = useAnimation();

  const handleButtonVote = async (type: VoteType) => {
    if (isVoting) return;

    const animationProps = {
      superLike: { x: 1000, y: 0, rotate: 30, opacity: 0 },
      up: { x: 0, y: -1000, rotate: 0, opacity: 0 },
      neutral: { x: -1000, y: 0, rotate: -30, opacity: 0 },
    }[type];

    await new Promise(resolve => setTimeout(resolve, 200));
    await controls.start({
      ...animationProps,
      transition: { duration: 0.5 },
    });

    await onVote(type);
    await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  };

  // Create an array for background cards (max 3)
  const stackedCards = Math.min(remainingCount, 3);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-full max-w-md">
        {/* Background stacked cards */}
        {Array.from({ length: stackedCards }).map((_, index) => (
          <div
            key={`stack-${index}`}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${(index + 1) * 8}px) translateX(${(index + 1) * 2}px) scale(${1 - (index + 1) * 0.02})`,
              opacity: 0.8 - index * 0.15,
              zIndex: -index - 1,
              filter: `brightness(${1 - (index + 1) * 0.05})`,
            }}
          >
            <div className="min-h-[420px] w-full bg-white dark:bg-gray-800 rounded-[32px] p-8 flex flex-col shadow-md" />
          </div>
        ))}

        {/* Main card */}
        <motion.div
          key="card"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={controls}
          className="relative z-10 w-full touch-none"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
          }}
          {...dragProps}
        >
          <div className={`min-h-[420px] w-full bg-white dark:bg-gray-800 rounded-[32px] p-8 flex flex-col shadow-lg ${isVoting ? 'opacity-75' : ''}`}>
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
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md px-4">
        <motion.button
          onClick={() => handleButtonVote('neutral')}
          className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-2xl
            bg-white dark:bg-gray-800 text-red-500 font-medium 
            hover:bg-red-50 dark:hover:bg-red-900/20 
            shadow-lg hover:shadow-xl transition-all duration-200
            disabled:opacity-50"
          whileHover={{ scale: isVoting ? 1 : 1.05 }}
          whileTap={{ scale: isVoting ? 1 : 0.95 }}
          disabled={isVoting}
        >
          <span className="text-3xl">🤷</span>
          <span>Meh</span>
        </motion.button>
        <motion.button
          onClick={() => handleButtonVote('up')}
          className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-2xl
            bg-white dark:bg-gray-800 text-yellow-600 font-medium 
            hover:bg-yellow-50 dark:hover:bg-yellow-900/20
            shadow-lg hover:shadow-xl transition-all duration-200
            disabled:opacity-50"
          whileHover={{ scale: isVoting ? 1 : 1.05 }}
          whileTap={{ scale: isVoting ? 1 : 0.95 }}
          disabled={isVoting}
        >
          <span className="text-3xl">👍</span>
          <span>Neat</span>
        </motion.button>
        <motion.button
          onClick={() => handleButtonVote('superLike')}
          className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-2xl
            bg-white dark:bg-gray-800 text-green-500 font-medium 
            hover:bg-green-50 dark:hover:bg-green-900/20
            shadow-lg hover:shadow-xl transition-all duration-200
            disabled:opacity-50"
          whileHover={{ scale: isVoting ? 1 : 1.05 }}
          whileTap={{ scale: isVoting ? 1 : 0.95 }}
          disabled={isVoting}
        >
          <span className="text-3xl">❤️</span>
          <span>Love</span>
        </motion.button>
      </div>
    </div>
  );
} 