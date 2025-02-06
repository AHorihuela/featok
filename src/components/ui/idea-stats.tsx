'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaStats {
  title: string;
  description: string;
  votes: {
    superLike: number;
    up: number;
    neutral: number;
  };
}

interface IdeaStatsProps {
  ideas: IdeaStats[];
}

type SortKey = 'superLike' | 'up' | 'neutral' | 'total' | 'score';

function IdeaStatsComponent({ ideas }: IdeaStatsProps) {
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const calculateScore = (idea: IdeaStats) => {
    return (idea.votes.superLike * 3) + (idea.votes.up * 2) + (idea.votes.neutral * 1);
  };

  const calculateTotal = (idea: IdeaStats) => {
    return idea.votes.superLike + idea.votes.up + idea.votes.neutral;
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    let aValue = 0;
    let bValue = 0;

    switch (sortBy) {
      case 'superLike':
        aValue = a.votes.superLike;
        bValue = b.votes.superLike;
        break;
      case 'up':
        aValue = a.votes.up;
        bValue = b.votes.up;
        break;
      case 'neutral':
        aValue = a.votes.neutral;
        bValue = b.votes.neutral;
        break;
      case 'total':
        aValue = calculateTotal(a);
        bValue = calculateTotal(b);
        break;
      case 'score':
        aValue = calculateScore(a);
        bValue = calculateScore(b);
        break;
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const maxScore = Math.max(...ideas.map(calculateScore));
  const maxVotes = Math.max(...ideas.map(calculateTotal));

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => toggleSort('score')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            sortBy === 'score'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('superLike')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            sortBy === 'superLike'
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Love {sortBy === 'superLike' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('up')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            sortBy === 'up'
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Neat {sortBy === 'up' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('neutral')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            sortBy === 'neutral'
              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Meh {sortBy === 'neutral' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('total')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            sortBy === 'total'
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Total Votes {sortBy === 'total' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sortedIdeas.map((idea, index) => {
            const score = calculateScore(idea);
            const total = calculateTotal(idea);
            const scorePercentage = (score / (maxScore || 1)) * 100;
            const votesPercentage = (total / (maxVotes || 1)) * 100;

            return (
              <motion.div
                key={idea.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <div className="mb-2">
                  <h3 className="font-medium text-lg">{idea.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {idea.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Score Bar */}
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercentage}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>

                  {/* Vote Distribution */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">❤️</span>
                      <span>{idea.votes.superLike}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">😊</span>
                      <span>{idea.votes.up}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">🤷</span>
                      <span>{idea.votes.neutral}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-500">Score:</span>
                      <span className="font-medium">{score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const IdeaStats = IdeaStatsComponent; 