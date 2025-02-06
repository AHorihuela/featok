import { motion, useAnimation } from 'framer-motion';
import { ProductIdea, VoteType } from '@/types/ideas';

interface IdeaCardProps {
  idea: ProductIdea;
  swipeDirection: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
}

export function IdeaCard({ idea, swipeDirection, onVote }: IdeaCardProps) {
  const controls = useAnimation();

  const handleButtonVote = async (type: VoteType) => {
    // Define animation properties based on vote type
    const animationProps = {
      superLike: { x: 1000, y: 0, rotate: 30, opacity: 0 },
      up: { x: 0, y: -1000, rotate: 0, opacity: 0 },
      neutral: { x: -1000, y: 0, rotate: -30, opacity: 0 },
    }[type];

    // Animate the card
    await controls.start({
      ...animationProps,
      transition: { duration: 0.5 },
    });

    // Submit the vote
    await onVote(type);

    // Reset the card position
    await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  };

  return (
    <motion.div
      key="card"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 touch-none min-h-[420px] flex flex-col"
      style={{ touchAction: 'none' }}
      animate={controls}
    >
      <div className="flex-grow">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {idea.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          {idea.description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <motion.button
          onClick={() => handleButtonVote('neutral')}
          className="w-full py-4 px-4 rounded-2xl bg-red-50 text-red-500 font-medium text-lg hover:bg-red-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🤷 Meh
        </motion.button>
        <motion.button
          onClick={() => handleButtonVote('up')}
          className="w-full py-4 px-4 rounded-2xl bg-yellow-50 text-yellow-600 font-medium text-lg hover:bg-yellow-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          😊 Neat
        </motion.button>
        <motion.button
          onClick={() => handleButtonVote('superLike')}
          className="w-full py-4 px-4 rounded-2xl bg-green-50 text-green-500 font-medium text-lg hover:bg-green-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ❤️ Love
        </motion.button>
      </div>
    </motion.div>
  );
} 