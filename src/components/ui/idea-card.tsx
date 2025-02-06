import { motion, useAnimation } from 'framer-motion';
import { ProductIdea, VoteType } from '@/types/ideas';

interface IdeaCardProps {
  idea: ProductIdea;
  swipeDirection: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
  isVoting?: boolean;
}

export function IdeaCard({ idea, swipeDirection, onVote, isVoting = false }: IdeaCardProps) {
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

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        key="card"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={controls}
        className="w-full max-w-md"
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