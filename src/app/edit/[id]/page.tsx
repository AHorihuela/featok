'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMenu } from '@/components/ui/app-menu';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface IdeaInput {
  title: string;
  description: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ProductIdea {
  title: string;
  description: string;
  order: number;
}

export default function EditIdeas({ params }: PageProps) {
  const { id } = use(params);
  const [ideas, setIdeas] = useState<IdeaInput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  const fetchIdeas = useCallback(async (creatorId: string) => {
    try {
      const response = await fetch(`/api/ideas/group/${id}`);
      if (!response.ok) throw new Error('Failed to fetch ideas');
      const data = await response.json();

      // Verify creator
      if (data[0]?.creatorId !== creatorId) {
        setError('You do not have permission to edit this list');
        return;
      }

      // Convert to text format
      const textContent = data
        .sort((a: ProductIdea, b: ProductIdea) => a.order - b.order)
        .map((idea: ProductIdea) => `${idea.title}\n${idea.description}`)
        .join('\n\n');

      setCurrentInput(textContent);
      setIdeas(
        data.map((idea: ProductIdea) => ({
          title: idea.title,
          description: idea.description,
        }))
      );
    } catch (error) {
      setError('Failed to load ideas. Please try again later.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const creatorId = localStorage.getItem('featok_creator_id');
    if (!creatorId) {
      setError('You must be the creator to edit this list');
      setIsLoading(false);
      return;
    }

    fetchIdeas(creatorId);
  }, [fetchIdeas]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const parseIdeas = (text: string): IdeaInput[] => {
    return text
      .split(/\n\s*\n/)
      .filter(block => block.trim())
      .map(block => {
        const lines = block.split('\n');
        const title = lines[0].replace(/^[-*•]?\s*/, '').trim();
        const description = lines.slice(1).join('\n').trim();
        return { title, description: description || title };
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInput(e.target.value);
    setIdeas(parseIdeas(e.target.value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ideas.length === 0) {
      showToast('Please add at least one idea', 'error');
      return;
    }

    const creatorId = localStorage.getItem('featok_creator_id');
    if (!creatorId) {
      showToast('You must be the creator to edit this list', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/ideas/group/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideas, creatorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update ideas');
      }

      showToast('Ideas updated successfully!');
      setTimeout(() => {
        router.push('/my-lists');
      }, 1000);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update ideas',
        'error'
      );
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
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
            onClick={() => router.push('/my-lists')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to My Lists
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Ideas</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Edit Ideas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Each idea should have a title on the first line and description on following
                lines. Separate ideas with blank lines.
              </p>
            </div>

            <textarea
              value={currentInput}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none min-h-[400px]"
              placeholder="Product Idea 1
This is the description for idea 1

Product Idea 2
This is the description for idea 2"
            />

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{ideas.length} ideas</span>
            </div>
          </div>

          {ideas.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Preview:</h4>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded p-3 text-sm"
                  >
                    <div className="font-medium">{idea.title}</div>
                    {idea.description !== idea.title && (
                      <div className="text-gray-600 dark:text-gray-300 mt-1 text-xs">
                        {idea.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={ideas.length === 0 || isSaving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`px-4 py-2 rounded-lg shadow-lg ${
                  toast.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AppMenu groupId={id} />
      </div>
    </main>
  );
} 