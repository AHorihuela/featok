'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Link, Check } from 'lucide-react';

interface IdeaStats {
  title: string;
  description: string;
  votes: {
    superLike: number;
    up: number;
    neutral: number;
  };
  views: number;
}

interface IdeaStatsProps {
  ideas: IdeaStats[];
  groupId: string;
}

type SortKey = 'superLike' | 'up' | 'neutral' | 'total' | 'score';

export function IdeaStatsComponent({ ideas, groupId }: IdeaStatsProps) {
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copied, setCopied] = useState(false);

  const calculateVoteRatios = (idea: IdeaStats) => {
    const total = calculateTotal(idea);
    if (total === 0) return { superLike: 0, up: 0, neutral: 0 };

    return {
      superLike: (idea.votes.superLike / total) * 100,
      up: (idea.votes.up / total) * 100,
      neutral: (idea.votes.neutral / total) * 100,
    };
  };

  const calculateScore = (idea: IdeaStats) => {
    const ratios = calculateVoteRatios(idea);
    // Weight the ratios: superLike(3), up(2), neutral(1)
    return (ratios.superLike * 3) + (ratios.up * 2) + (ratios.neutral * 1);
  };

  const calculateTotal = (idea: IdeaStats) => {
    return idea.votes.superLike + idea.votes.up + idea.votes.neutral;
  };

  const sortIdeas = (ideas: IdeaStats[], key: SortKey) => {
    return [...ideas].sort((a, b) => {
      if (key === 'total') {
        return calculateTotal(b) - calculateTotal(a);
      }
      if (key === 'score') {
        return calculateScore(b) - calculateScore(a);
      }
      return b.votes[key] - a.votes[key];
    });
  };

  const sortedIdeas = sortIdeas(ideas, sortBy);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const maxScore = Math.max(...ideas.map(calculateScore));

  const handleDownload = () => {
    // Create CSV headers
    const headers = [
      'Title',
      'Description',
      'Love Votes',
      'Neat Votes',
      'Meh Votes',
      'Total Votes',
      'Score'
    ];

    // Convert ideas to CSV rows
    const rows = sortedIdeas.map(idea => [
      idea.title,
      idea.description,
      idea.votes.superLike,
      idea.votes.up,
      idea.votes.neutral,
      calculateTotal(idea),
      calculateScore(idea)
    ]);

    // Combine headers and rows with proper newlines
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'idea_voting_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/swipe/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Link size={16} />
                <span>Share Link</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sortedIdeas.map((idea, index) => {
            const ratios = calculateVoteRatios(idea);
            const score = calculateScore(idea);
            const total = calculateTotal(idea);
            const scorePercentage = (score / (maxScore || 1)) * 100;

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
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercentage}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">❤️</span>
                      <span>{(ratios.superLike).toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">({idea.votes.superLike})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">👍</span>
                      <span>{(ratios.up).toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">({idea.votes.up})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">🤷</span>
                      <span>{(ratios.neutral).toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">({idea.votes.neutral})</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-500">Views:</span>
                      <span className="font-medium">{idea.views || 0}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm text-gray-500">Votes:</span>
                      <span className="font-medium">{total}</span>
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