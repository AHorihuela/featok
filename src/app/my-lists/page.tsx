'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface IdeaGroup {
  groupId: string;
  ideas: Array<{
    title: string;
    description: string;
    votes: {
      superLike: number;
      up: number;
      neutral: number;
    };
  }>;
  createdAt: string;
}

export default function MyLists() {
  const [groups, setGroups] = useState<IdeaGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const creatorId = localStorage.getItem('featok_creator_id');
    if (!creatorId) {
      setError('No creator ID found. Try creating a new list first!');
      setIsLoading(false);
      return;
    }

    fetchGroups(creatorId);
  }, []);

  const fetchGroups = async (creatorId: string) => {
    try {
      const response = await fetch(`/api/ideas/creator/${creatorId}`);
      if (!response.ok) throw new Error('Failed to fetch lists');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      setError('Failed to load your lists. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (groupId: string) => {
    router.push(`/edit/${groupId}`);
  };

  const handleNew = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleNew}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create New List
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Idea Lists</h1>
          <button
            onClick={handleNew}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create New List
          </button>
        </div>

        <div className="space-y-6">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No lists created yet.</p>
              <button
                onClick={handleNew}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            groups.map(group => (
              <motion.div
                key={group.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {group.ideas[0].title}
                      {group.ideas.length > 1 && ` + ${group.ideas.length - 1} more`}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(group.groupId)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/swipe/${group.groupId}`)}
                      className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                    >
                      View Results
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  {group.ideas.slice(0, 3).map(idea => (
                    <div key={idea.title} className="space-y-1">
                      <p className="font-medium truncate">{idea.title}</p>
                      <div className="text-xs">
                        🔥 {idea.votes.superLike} | ✨ {idea.votes.up} | 😐 {idea.votes.neutral}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 