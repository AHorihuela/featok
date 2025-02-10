import { useEffect, useMemo } from 'react';
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
  // Calculate sorted ideas and stats
  const processedIdeas = useMemo(() => {
    return ideas.map(idea => {
      const totalVotes = idea.votes.superLike + idea.votes.up + idea.votes.neutral;
      const superLikePercentage = totalVotes > 0 ? Math.round((idea.votes.superLike / totalVotes) * 100) : 0;
      const upPercentage = totalVotes > 0 ? Math.round((idea.votes.up / totalVotes) * 100) : 0;
      const neutralPercentage = totalVotes > 0 ? Math.round((idea.votes.neutral / totalVotes) * 100) : 0;
      
      return {
        ...idea,
        totalVotes,
        superLikePercentage,
        upPercentage,
        neutralPercentage,
        score: (idea.votes.superLike * 2) + idea.votes.up // Weighted score
      };
    }).sort((a, b) => b.score - a.score);
  }, [ideas]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalVotes = ideas.reduce((sum, idea) => 
      sum + idea.votes.superLike + idea.votes.up + idea.votes.neutral, 0);
    const totalSuperLikes = ideas.reduce((sum, idea) => sum + idea.votes.superLike, 0);
    const totalUps = ideas.reduce((sum, idea) => sum + idea.votes.up, 0);
    const totalNeutrals = ideas.reduce((sum, idea) => sum + idea.votes.neutral, 0);
    
    return {
      totalVotes,
      avgVotesPerIdea: Math.round(totalVotes / ideas.length),
      superLikePercentage: Math.round((totalSuperLikes / totalVotes) * 100) || 0,
      upPercentage: Math.round((totalUps / totalVotes) * 100) || 0,
      neutralPercentage: Math.round((totalNeutrals / totalVotes) * 100) || 0
    };
  }, [ideas]);

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
      className="min-h-screen flex items-center justify-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center max-w-3xl mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          All Done! 🎉
        </motion.h1>

        {/* Overall Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-500">{stats.totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-500">{stats.avgVotesPerIdea}</div>
            <div className="text-sm text-gray-600">Avg Votes/Idea</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-purple-500">{stats.superLikePercentage}%</div>
            <div className="text-sm text-gray-600">Love Rate</div>
          </div>
        </motion.div>
        
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
          <h2 className="text-xl font-semibold mb-6">Ideas Ranked by Popularity</h2>
          {processedIdeas.map((idea, index) => (
            <motion.div
              key={idea._id}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    {index < 3 && (
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    {idea.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{idea.totalVotes} votes</div>
                  <div className="text-sm text-gray-500">Score: {idea.score}</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-sm">
                  <div className="font-medium text-green-600">❤️ {idea.votes.superLike}</div>
                  <div className="text-gray-500">{idea.superLikePercentage}%</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-yellow-600">👍 {idea.votes.up}</div>
                  <div className="text-gray-500">{idea.upPercentage}%</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-red-600">🤷 {idea.votes.neutral}</div>
                  <div className="text-gray-500">{idea.neutralPercentage}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${idea.superLikePercentage}%` }}
                  />
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ width: `${idea.upPercentage}%` }}
                  />
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${idea.neutralPercentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
} 