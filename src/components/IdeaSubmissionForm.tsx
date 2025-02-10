'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATOR_ID_KEY } from '@/components/ui/app-init';

interface IdeaInput {
  title: string;
  description: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function IdeaSubmissionForm() {
  const [ideas, setIdeas] = useState<IdeaInput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [currentInput]);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const parseIdeas = (text: string): IdeaInput[] => {
    // First trim the entire text to remove leading/trailing blank lines
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    return trimmedText
      .split(/\n\s*\n/)
      .filter(block => block.trim())
      .map(block => {
        const lines = block.trim().split('\n');
        // Find first non-empty line for title
        const title = lines.find(line => line.trim())?.replace(/^[-*•]\s*/, '').trim() || '';
        // Get all lines after the title for description
        const description = lines.slice(lines.findIndex(line => line.trim()) + 1)
          .join('\n')
          .trim();
        
        return { 
          title,
          description: description || title
        };
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const parsedIdeas = parseIdeas(e.target.value);
    console.log('All parsed ideas:', parsedIdeas);
    setCurrentInput(e.target.value);
    setIdeas(parsedIdeas);
  };

  const validateIdeas = (ideas: IdeaInput[]): boolean => {
    console.log('Validating ideas:', ideas);
    if (ideas.length === 0) {
      showToast('Please add at least one idea', 'error');
      return false;
    }

    const invalidIdeas = ideas.filter(idea => !idea.title.trim());
    if (invalidIdeas.length > 0) {
      console.log('Invalid ideas found:', invalidIdeas);
      showToast(`Found ${invalidIdeas.length} ideas without titles`, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateIdeas(ideas)) {
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
        body: JSON.stringify({ 
          ideas: ideas.map(idea => ({
            title: idea.title.trim(),
            description: idea.description.trim() || idea.title.trim()
          })),
          creatorId 
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.message || response.statusText || 'Failed to submit ideas');
      }

      // Store the group ID in localStorage for editing later
      const createdGroups = JSON.parse(localStorage.getItem('featok_created_groups') || '[]');
      createdGroups.push(data.groupId);
      localStorage.setItem('featok_created_groups', JSON.stringify(createdGroups));

      showToast('Ideas submitted successfully!');
      // Wait for the toast to be visible before redirecting
      setTimeout(() => {
        router.push(`/swipe/${data.groupId}`);
      }, 1000);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to submit ideas',
        'error'
      );
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
            Enter one idea per block, separated by blank lines. First line is
            the title, following lines are the description.
          </p>
        </div>

        <textarea
          ref={textareaRef}
          value={currentInput}
          onChange={handleInputChange}
          className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            font-mono text-base leading-relaxed resize-none min-h-[300px]
            bg-white dark:bg-gray-800 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            shadow-sm hover:shadow-md transition-shadow duration-200"
          placeholder="AI-Powered Recipe Generator
An app that generates personalized recipes based on available ingredients and dietary preferences.

Smart Home Energy Monitor
A device that tracks and optimizes home energy usage in real-time using AI.

Local Event Discovery App
App that curates personalized local event recommendations based on user interests and past activities."
          spellCheck="false"
          autoComplete="off"
        />

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
          </span>
          {currentInput && (
            <button
              type="button"
              onClick={() => setCurrentInput('')}
              className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
              disabled={isSubmitting}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mt-6">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">Preview:</h4>
          <div className="space-y-3">
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-2">{idea.title}</div>
                {idea.description !== idea.title && (
                  <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {idea.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={ideas.length === 0 || isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl 
            hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium
            shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
        >
          {isSubmitting ? 'Submitting...' : `Submit ${ideas.length} ${ideas.length === 1 ? 'Idea' : 'Ideas'}`}
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
