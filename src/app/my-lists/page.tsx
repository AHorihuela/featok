'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppMenu } from '@/components/ui/app-menu';
import { IdeaStats } from '@/components/ui/idea-stats';
import { Link, Check, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface IdeaGroup {
  groupId: string;
  groupTitle: string;
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
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

  const handleCopyLink = (groupId: string) => {
    const url = `${window.location.origin}/swipe/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (groupId: string) => {
    const creatorId = localStorage.getItem('featok_creator_id');
    if (!creatorId) return;

    try {
      const response = await fetch(`/api/ideas/group/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      // Remove the deleted group from state
      setGroups(prevGroups => prevGroups.filter(group => group.groupId !== groupId));
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteGroupId(null);
    }
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedGroup(
                    expandedGroup === group.groupId ? null : group.groupId
                  )}
                >
                  <div className="flex justify-between items-start mb-4" onClick={e => e.stopPropagation()}>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {group.groupTitle || group.ideas[0].title}
                        {group.ideas.length > 1 && ` (${group.ideas.length} ideas)`}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(group.groupId)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 flex items-center justify-center"
                        aria-label="Copy share link"
                      >
                        {copiedId === group.groupId ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Link size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(group.groupId)}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteGroupId(group.groupId)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 flex items-center justify-center"
                        aria-label="Delete list"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedGroup === group.groupId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      onClick={e => e.stopPropagation()}
                    >
                      <IdeaStats ideas={group.ideas.map(idea => ({
                        ...idea,
                        views: 0
                      }))} groupId={group.groupId} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AppMenu />

        <ConfirmModal
          isOpen={deleteGroupId !== null}
          title="Delete List"
          message="Are you sure you want to delete this list? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteGroupId && handleDelete(deleteGroupId)}
          onCancel={() => setDeleteGroupId(null)}
        />
      </div>
    </main>
  );
} 