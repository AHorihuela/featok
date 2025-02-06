import { motion, AnimatePresence } from 'framer-motion';
import { VoteConfirmation } from '@/types/ideas';

interface VoteToastProps {
  voteConfirmation: VoteConfirmation | null;
}

export function VoteToast({ voteConfirmation }: VoteToastProps) {
  return (
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
            {voteConfirmation.type === 'up' && '👍'}
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
  );
} 