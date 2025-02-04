'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Idea {
  _id: string;
  text: string;
  votes: {
    up: number;
    down: number;
  };
}

interface Toast {
  id: number;
  type: 'up' | 'down' | 'skip';
  text: string;
  idea: Idea;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 800;
const FLY_AWAY_DISTANCE = 1000;

const TOAST_DURATION = 3000; // 3 seconds

export default function SwipePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const params = useParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        storedUserId = Math.random().toString(36).substring(7);
        localStorage.setItem('userId', storedUserId);
      }
      setUserId(storedUserId);
    }
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get(`/api/collections/${params.id}/ideas`);
      setIdeas(response.data);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    }
  };

  const showToast = (type: 'up' | 'down' | 'skip', idea: Idea) => {
    const text = type === 'up' ? 'Liked' : type === 'down' ? 'Disliked' : 'Skipped';
    const id = Date.now();
    const toast = { id, type, text, idea };
    setToasts(prev => [...prev, toast]);

    // Remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  };

  const handleVote = async (vote: 'up' | 'down' | 'skip') => {
    if (currentIndex >= ideas.length) return;

    const idea = ideas[currentIndex];
    try {
      if (vote !== 'skip') {
        await axios.post(`/api/ideas/${idea._id}/vote`, {
          userId,
          vote
        });
      }
      setCurrentIndex(prev => prev + 1);
      showToast(vote, idea);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const handleUndo = async (toast: Toast) => {
    try {
      // Remove the toast immediately
      setToasts(prev => prev.filter(t => t.id !== toast.id));
      
      // Revert the current index
      setCurrentIndex(prev => prev - 1);
      
      // If it was a vote (not a skip), remove it
      if (toast.type !== 'skip') {
        await axios.post(`/api/ideas/${toast.idea._id}/vote`, {
          userId,
          vote: 'remove'
        });
      }
    } catch (error) {
      console.error('Failed to undo action:', error);
    }
  };

  if (!ideas.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ThemeToggle />
        <div className="text-2xl">Loading ideas...</div>
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ThemeToggle />
        <h1 className="text-3xl font-bold mb-4">All Done! 🎉</h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          You&apos;ve reviewed all the ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ThemeToggle />
      <div className="relative w-[90vw] max-w-md h-[60vh] mb-12">
        <AnimatePresence mode="popLayout">
          {[...ideas].slice(currentIndex, currentIndex + 3).map((idea, index) => (
            <Card
              key={idea._id}
              idea={idea}
              active={index === 0}
              onVote={handleVote}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transformOrigin: 'bottom center',
                transform: `scale(${1 - index * 0.05}) translateY(${-index * 8}px)`,
                zIndex: ideas.length - index,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => handleVote('down')}
          className="w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--accent-danger)',
            boxShadow: '0 4px 6px var(--shadow-color)'
          }}
          aria-label="Dislike"
        >
          <svg className="w-8 h-8" fill="var(--text-primary)" viewBox="0 0 24 24">
            <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12zm-12 5l-8-8 1.41-1.41L12 14.17l6.59-6.59L20 9l-8 8z" />
          </svg>
        </button>
        <button
          onClick={() => handleVote('skip')}
          className="w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            boxShadow: '0 4px 6px var(--shadow-color)'
          }}
          aria-label="Skip"
        >
          <svg className="w-8 h-8" fill="var(--text-primary)" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>
        <button
          onClick={() => handleVote('up')}
          className="w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--accent-secondary)',
            boxShadow: '0 4px 6px var(--shadow-color)'
          }}
          aria-label="Like"
        >
          <svg className="w-8 h-8" fill="var(--text-primary)" viewBox="0 0 24 24">
            <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </button>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: toast.type === 'up' 
                  ? 'var(--accent-secondary)' 
                  : toast.type === 'down'
                  ? 'var(--accent-danger)'
                  : 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              <span className="text-sm font-medium">{toast.text}</span>
              <button
                onClick={() => handleUndo(toast)}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                Undo
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Card({ idea, active, onVote, style }: { 
  idea: Idea; 
  active: boolean; 
  onVote: (vote: 'up' | 'down' | 'skip') => void;
  style: React.CSSProperties & {
    position: string;
    width: string;
    height: string;
    transformOrigin: string;
    transform: string;
    zIndex: number;
  };
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: {
    offset: { x: number; y: number };
    velocity: { x: number; y: number };
  }) => {
    const xVal = info.offset.x;
    const yVal = info.offset.y;
    const xVelocity = info.velocity.x;
    const yVelocity = info.velocity.y;
    
    if (Math.abs(xVelocity) > SWIPE_VELOCITY) {
      onVote(xVelocity > 0 ? 'up' : 'down');
      return;
    }
    
    if (Math.abs(yVelocity) > SWIPE_VELOCITY) {
      onVote('skip');
      return;
    }

    if (xVal < -SWIPE_THRESHOLD) {
      onVote('down');
    } else if (xVal > SWIPE_THRESHOLD) {
      onVote('up');
    } else if (yVal < -SWIPE_THRESHOLD) {
      onVote('skip');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const flyAwayVariants = {
    initial: { scale: 1 },
    exit: (custom: { x: number; y: number }) => ({
      x: custom.x * FLY_AWAY_DISTANCE,
      y: custom.y * FLY_AWAY_DISTANCE,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <motion.div
      layout
      style={{
        ...style,
        x: active ? x : 0,
        y: active ? y : 0,
        rotate: active ? rotate : 0,
      }}
      drag={active ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      variants={flyAwayVariants}
      initial="initial"
      exit="exit"
      custom={{ x: x.get() / Math.abs(x.get() || 1), y: y.get() / Math.abs(y.get() || 1) }}
      className="touch-none"
    >
      <div className="card w-full h-full p-8 flex flex-col justify-between">
        <div className="text-2xl font-medium text-center">{idea.text}</div>
        {active && (
          <div className="text-sm text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            Swipe right to like, left to dislike, or up to skip
          </div>
        )}
      </div>
    </motion.div>
  );
} 