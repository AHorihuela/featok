import { motion } from 'framer-motion';
import { ProductIdea, VoteType } from '@/types/ideas';

interface IdeaCardProps {
  idea: ProductIdea;
  swipeDirection: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
}

export function IdeaCard({ idea, swipeDirection, onVote }: IdeaCardProps) {
  return (
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
          {idea.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          {idea.description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <motion.button
          onClick={() => onVote('neutral')}
          className="w-full py-4 px-4 rounded-2xl bg-red-50 text-red-500 font-medium text-lg hover:bg-red-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🤷 Meh
        </motion.button>
        <motion.button
          onClick={() => onVote('up')}
          className="w-full py-4 px-4 rounded-2xl bg-yellow-50 text-yellow-600 font-medium text-lg hover:bg-yellow-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          😊 Neat
        </motion.button>
        <motion.button
          onClick={() => onVote('superLike')}
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