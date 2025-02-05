'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaInput {
  title: string;
  description: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const CREATOR_ID_KEY = 'featok_creator_id';

export default function IdeaSubmissionForm() {
  const [ideas, setIdeas] = useState<IdeaInput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Get or create creator ID on mount
  useEffect(() => {
    let creatorId = localStorage.getItem(CREATOR_ID_KEY);
    if (!creatorId) {
      creatorId = `creator_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      localStorage.setItem(CREATOR_ID_KEY, creatorId);
    }
  }, []);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentInput]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const parseIdeas = (text: string): IdeaInput[] => {
    // Split by double newline to separate ideas
    return text.split(/\n\s*\n/).filter(block => block.trim()).map(block => {
      const lines = block.split('\n');
      const title = lines[0].replace(/^[-*•]?\s*/, '').trim(); // Remove any list markers
      const description = lines.slice(1).join('\n').trim();
      return { title, description: description || title }; // Use title as description if none provided
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInput(e.target.value);
    setIdeas(parseIdeas(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ideas.length === 0) {
      showToast('Please add at least one idea', 'error');
      return;
    }
    
    const creatorId = localStorage.getItem(CREATOR_ID_KEY);
    if (!creatorId) {
      showToast('Failed to identify creator', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideas, creatorId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store the group ID in localStorage for editing later
        const createdGroups = JSON.parse(localStorage.getItem('featok_created_groups') || '[]');
        createdGroups.push(data.groupId);
        localStorage.setItem('featok_created_groups', JSON.stringify(createdGroups));

        showToast('Ideas submitted successfully!');
        // Wait for the toast to be visible before redirecting
        setTimeout(() => {
          router.push(`/swipe/${data.groupId}`);
        }, 1000);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to submit ideas', 'error');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Quick Add Ideas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter one idea per block, separated by blank lines. First line is the title, following lines are the description.
          </p>
        </div>

        <textarea
          ref={textareaRef}
          value={currentInput}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none min-h-[200px]"
          placeholder="Product Idea 1
This is the description for idea 1

Product Idea 2
This is the description for idea 2

Product Idea 3
This is the description for idea 3"
        />

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>{ideas.length} ideas</span>
          <button
            type="button"
            onClick={() => setCurrentInput('')}
            className="text-red-500 hover:text-red-600"
            disabled={!currentInput || isSubmitting}
          >
            Clear All
          </button>
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={ideas.length === 0 || isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : `Submit ${ideas.length} Ideas`}
        </button>
      </div>

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
    </form>
  );
} 