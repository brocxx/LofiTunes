'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { YTPlayer } from '@/types/youtube';

interface UseYouTubePlayerProps {
  onEnded?: () => void;
  onError?: () => void;
  onReady?: () => void;
}

export function useYouTubePlayer({ onEnded, onError, onReady }: UseYouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerId = 'yt-player-container-hidden';
  const apiLoadedCalledRef = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isReady, setIsReady] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    stopProgress();
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const ct = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (ct !== undefined) setCurrentTime(ct);
          if (dur !== undefined) setDuration(dur);
        } catch {
          // Player may not be ready yet
        }
      }
    }, 500);
  }, [stopProgress]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPlayer = () => {
      // Must ensure the DOM element exists
      if (!document.getElementById(containerId)) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: {
          autoplay: 1,
          controls: 0,
          origin: window.location.origin,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: event => {
            event.target.setVolume(volume);
            setIsReady(true);
            onReady?.();
          },
          onStateChange: event => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgress();
            } else if (
              state === window.YT.PlayerState.PAUSED ||
              state === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              stopProgress();
              if (state === window.YT.PlayerState.ENDED) {
                onEnded?.();
              }
            } else if (
              state === window.YT.PlayerState.UNSTARTED || 
              state === window.YT.PlayerState.CUED
            ) {
              // Auto-play when cued or unstarted as per instructions
              setIsPlaying(false);
              event.target.playVideo();
            }
          },
          onError: () => {
            setIsPlaying(false);
            stopProgress();
            onError?.();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else if (!apiLoadedCalledRef.current) {
      apiLoadedCalledRef.current = true;
      
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
      
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode?.insertBefore(tag, firstScript);
      }
    }

    return () => {
      stopProgress();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndPlay = useCallback((videoId: string) => {
    if (!playerRef.current) return;
    setCurrentTime(0);
    setDuration(0);
    playerRef.current.loadVideoById(videoId);
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  return {
    playerId: containerId,
    isPlaying,
    isReady,
    duration,
    currentTime,
    volume,
    loadAndPlay,
    togglePlay,
    setVolume,
    seekTo,
  };
}
