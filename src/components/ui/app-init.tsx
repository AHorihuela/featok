'use client';

import { useEffect } from 'react';

export const CREATOR_ID_KEY = 'featok_creator_id';

export function AppInit() {
  useEffect(() => {
    let creatorId = localStorage.getItem(CREATOR_ID_KEY);
    if (!creatorId) {
      creatorId = `creator_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      localStorage.setItem(CREATOR_ID_KEY, creatorId);
    }
  }, []);

  return null;
} 