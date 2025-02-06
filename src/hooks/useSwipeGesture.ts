import { useState } from 'react';
import { AnimationControls, PanInfo } from 'framer-motion';
import { VoteType } from '@/types/ideas';

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 0.3;

export function useSwipeGesture(
  controls: AnimationControls,
  handleVote: (type: VoteType) => Promise<void>
) {
  const [swipeDirection, setSwipeDirection] = useState<VoteType | null>(null);
  const [dragIntensity, setDragIntensity] = useState(0);

  const handleDrag = (
    event: PointerEvent | TouchEvent | MouseEvent,
    info: PanInfo
  ) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;

    const maxDragDistance = 150;
    let intensity = 0;

    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      intensity = Math.min(Math.abs(xOffset) / maxDragDistance, 1);
      if (xOffset > 50) {
        setSwipeDirection('superLike');
      } else if (xOffset < -50) {
        setSwipeDirection('neutral');
      }
    } else if (yOffset < -50) {
      intensity = Math.min(Math.abs(yOffset) / maxDragDistance, 1);
      setSwipeDirection('up');
    } else {
      setSwipeDirection(null);
    }

    setDragIntensity(intensity);
  };

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;
    const velocity = Math.max(
      Math.abs(info.velocity.x),
      Math.abs(info.velocity.y)
    );

    let direction: VoteType | null = null;

    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      if (xOffset > SWIPE_THRESHOLD) {
        direction = 'superLike';
      } else if (xOffset < -SWIPE_THRESHOLD) {
        direction = 'neutral';
      }
    } else if (yOffset < -SWIPE_THRESHOLD) {
      direction = 'up';
    }

    if (direction && velocity >= SWIPE_VELOCITY) {
      const animationProps = {
        superLike: { x: 1000, y: 0, rotate: 30 },
        up: { x: 0, y: -1000, rotate: 0 },
        neutral: { x: -1000, y: 0, rotate: -30 },
      }[direction];

      await controls.start({
        ...animationProps,
        opacity: 0,
        transition: { duration: 0.5 },
      });

      await handleVote(direction);
      await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1 });
    }

    setSwipeDirection(null);
    setDragIntensity(0);
  };

  return {
    swipeDirection,
    dragIntensity,
    handleDrag,
    handleDragEnd,
  };
} 