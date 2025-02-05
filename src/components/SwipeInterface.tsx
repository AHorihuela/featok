'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Idea {
  _id: string;
  title: string;
  description: string;
  votes: {
    up: number;
    down: number;
  };
}

interface SwipeInterfaceProps {
  idea: Idea;
  onVote: (type: 'up' | 'down') => Promise<void>;
}

export default function SwipeInterface({ idea, onVote }: SwipeInterfaceProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const handleVote = async (type: 'up' | 'down') => {
    if (isVoting) return;

    setIsVoting(true);
    setDirection(type);

    try {
      await onVote(type);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
      setDirection(null);
    }
  };

  return (
    <div className="h-[70vh] flex items-center justify-center px-4">
      <AnimatePresence>
        <motion.div
          key={idea._id}
          initial={{ scale: 1 }}
          animate={{
            scale: 1,
            x: direction === 'up' ? 1000 : direction === 'down' ? -1000 : 0,
            rotate: direction === 'up' ? 45 : direction === 'down' ? -45 : 0,
          }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">{idea.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {idea.description}
            </p>

            <div className="flex justify-center space-x-4 pt-4">
              <button
                onClick={() => handleVote('down')}
                disabled={isVoting}
                className="p-4 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                👎
              </button>
              <button
                onClick={() => handleVote('up')}
                disabled={isVoting}
                className="p-4 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                👍
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
