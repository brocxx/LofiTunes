'use client';

import { useEffect, useState } from 'react';

interface GifBackgroundProps {
  gif: { url: string; label: string };
  onError?: () => void;
}

export function GifBackground({ gif, onError }: GifBackgroundProps) {
  const [displayed, setDisplayed] = useState(gif);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Crossfade between GIFs
    setOpacity(0);
    const timer = setTimeout(() => {
      setDisplayed(gif);
      setOpacity(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [gif]);

  return (
    <>
      <img
        className="gif-bg"
        src={displayed.url}
        alt={displayed.label}
        style={{ 
          position: 'fixed',
          top: 0, 
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
          opacity, 
          transition: 'opacity 0.6s ease' 
        }}
        onError={e => {
          if (onError) onError();
          else (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="overlay" />
    </>
  );
}
