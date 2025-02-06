import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ProductIdea } from '@/types/ideas';

interface CompletionScreenProps {
  ideas: ProductIdea[];
  isCreator: boolean;
  onEdit: () => void;
  onManage: () => void;
}

export function CompletionScreen({ ideas, isCreator, onEdit, onManage }: CompletionScreenProps) {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since they fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []); // Empty dependency array since we want this to run once

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center max-w-2xl mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          All Done! 🎉
        </motion.h1>
        <motion.p 
          className="text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You&apos;ve voted on all the ideas in this group.
        </motion.p>
        
        {isCreator && (
          <motion.div 
            className="flex justify-center gap-4 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit List
            </button>
            <button
              onClick={onManage}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Manage Lists
            </button>
          </motion.div>
        )}
        
        <motion.div 
          className="mt-8 space-y-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-semibold">Final Results:</h2>
          {ideas.map((idea, index) => (
            <motion.div
              key={idea._id}
              className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <h3 className="font-medium">{idea.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                ❤️ {idea.votes.superLike} | 👍 {idea.votes.up} | 🤷 {idea.votes.neutral}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
} 