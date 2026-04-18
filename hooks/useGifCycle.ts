'use client';

import { useEffect, useState, useCallback } from 'react';
import { LOFI_GIFS } from '@/lib/gifs';

export function useGifCycle() {
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentGifIndex(Math.floor(Math.random() * LOFI_GIFS.length));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const cycleGif = useCallback(() => {
    setCurrentGifIndex(prev => {
      let next;
      do {
        next = Math.floor(Math.random() * LOFI_GIFS.length);
      } while (next === prev && LOFI_GIFS.length > 1);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger if user is focused on an input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        cycleGif();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleGif]);

  useEffect(() => {
    const themes = [
      "#A8C5DA","#D4A96A","#C3B1E1","#D4A5A5","#A8C5A0",
      "#C4875A","#8BA7C7","#C8B97A","#8A9BB5","#C47A8A",
      "#D4A882","#C8B89A","#A0BCC8","#C09060","#7AACAA"
    ];
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', themes[currentGifIndex] || themes[0]);
    }
  }, [currentGifIndex]);

  return {
    currentGifIndex: isMounted ? currentGifIndex : 0,
    currentGif: isMounted ? LOFI_GIFS[currentGifIndex] : LOFI_GIFS[0],
    cycleGif,
  };
}
