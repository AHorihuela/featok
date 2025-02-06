import { motion, AnimatePresence } from 'framer-motion';
import { VoteConfirmation } from '@/types/ideas';

interface UndoButtonProps {
  lastVote: VoteConfirmation | null;
  onUndo: () => void;
}

export function UndoButton({ lastVote, onUndo }: UndoButtonProps) {
  return (
    <AnimatePresence>
      {lastVote && (
        <motion.button
          onClick={onUndo}
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
  );
} 