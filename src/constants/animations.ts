import { VoteType } from '@/types/ideas';

export const SWIPE_ANIMATIONS = {
  THRESHOLD: 100,
  VELOCITY: 0.3,
  ROTATION_FACTOR: 0.1,
  MAX_DRAG_DISTANCE: 150,
  ANIMATION_DURATION: 0.5,
} as const;

export const VOTE_ANIMATIONS: Record<VoteType, { x: number; y: number; rotate: number }> = {
  superLike: { x: 1000, y: 0, rotate: 30 },
  up: { x: 0, y: -1000, rotate: 0 },
  neutral: { x: -1000, y: 0, rotate: -30 },
} as const; 