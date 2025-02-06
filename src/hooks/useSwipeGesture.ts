import { useState } from 'react';
import { AnimationControls, PanInfo } from 'framer-motion';
import { VoteType } from '@/types/ideas';
import { SWIPE_ANIMATIONS, VOTE_ANIMATIONS } from '@/constants/animations';

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

    // Calculate rotation based on drag distance (clamped between -30 and 30 degrees)
    const rotate = Math.min(Math.max(xOffset * 0.1, -30), 30);

    // Simple position and rotation update without spring physics
    controls.set({ 
      x: xOffset, 
      y: yOffset,
      rotate
    });

    let intensity = 0;

    if (Math.abs(xOffset) > Math.abs(yOffset)) {
      intensity = Math.min(Math.abs(xOffset) / SWIPE_ANIMATIONS.MAX_DRAG_DISTANCE, 1);
      if (xOffset > 50) {
        setSwipeDirection('superLike');
      } else if (xOffset < -50) {
        setSwipeDirection('neutral');
      }
    } else if (yOffset < -50) {
      intensity = Math.min(Math.abs(yOffset) / SWIPE_ANIMATIONS.MAX_DRAG_DISTANCE, 1);
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
      if (xOffset > SWIPE_ANIMATIONS.THRESHOLD) {
        direction = 'superLike';
      } else if (xOffset < -SWIPE_ANIMATIONS.THRESHOLD) {
        direction = 'neutral';
      }
    } else if (yOffset < -SWIPE_ANIMATIONS.THRESHOLD) {
      direction = 'up';
    }

    if (direction && velocity >= SWIPE_ANIMATIONS.VELOCITY) {
      const animationProps = VOTE_ANIMATIONS[direction];

      await controls.start({
        ...animationProps,
        opacity: 0,
        scale: 0.8,
        transition: { 
          duration: SWIPE_ANIMATIONS.ANIMATION_DURATION,
          ease: [0.32, 0.72, 0, 1]
        },
      });

      await handleVote(direction);
      await controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
    } else {
      // Simple return to center
      controls.start({ 
        x: 0, 
        y: 0, 
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      });
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