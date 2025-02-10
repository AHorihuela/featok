'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMenu } from '@/components/ui/app-menu';
import { Link, Check, Trash2, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { IdeaStatsComponent } from '@/components/ui/idea-stats';

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
    views?: number;
  }>;
  createdAt: string;
}

export default function MyLists() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<IdeaGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchGroups = async (creatorId: string, retryCount = 0) => {
    try {
      const response = await fetch(`/api/ideas/creator/${creatorId}`);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        if (retryCount < 3) {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchGroups(creatorId, retryCount + 1);
        }
        setError('Server returned an invalid response. Please try again later.');
        return;
      }
      
      if (!response.ok) {
        const errorMessage = data.error?.message || 'Failed to fetch lists';
        const errorDetails = data.error?.details;
        
        if (response.status === 503) {
          if (retryCount < 3) {
            // Wait a bit longer for DB connection issues
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fetchGroups(creatorId, retryCount + 1);
          }
          setError('Database connection failed. Please try again in a few minutes.');
        } else if (response.status === 400) {
          setError('Invalid creator ID. Please try creating a new list.');
        } else {
          setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
        }
        console.error('Fetch error:', data.error);
        return;
      }

      setGroups(data);
    } catch (error) {
      console.error('Fetch error:', error);
      if (retryCount < 3) {
        // Wait a bit and retry network errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchGroups(creatorId, retryCount + 1);
      }
      setError('Failed to load your lists. Please check your internet connection and try again.');
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
    
    // Try using the modern clipboard API first
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(groupId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      // Fallback: Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand('copy');
        setCopiedId(groupId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      } finally {
        document.body.removeChild(textarea);
      }
    }
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

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
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
            <AnimatePresence>
              {groups.map((group) => (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{group.groupTitle}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {group.ideas.length} ideas • Created {new Date(group.createdAt).toLocaleDateString()}
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
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setDeleteGroupId(group.groupId)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => toggleExpand(group.groupId)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {expandedGroups.includes(group.groupId) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedGroups.includes(group.groupId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 overflow-hidden"
                      >
                        <IdeaStatsComponent 
                          ideas={group.ideas.map(idea => ({
                            ...idea,
                            views: idea.views || 0
                          }))} 
                          groupId={group.groupId} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
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