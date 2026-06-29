import { useCallback, useState, useEffect } from 'react';
import type mpegts from 'mpegts.js';

interface UsePlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  mpegtsRef: React.MutableRefObject<mpegts.Player | null>;
  addLog: (message: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export function usePlayerControls({
  videoRef,
  containerRef,
  mpegtsRef,
  addLog,
}: UsePlayerControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedMuted = localStorage.getItem('cholostream_muted');
      const storedVolume = localStorage.getItem('cholostream_volume');
      
      const initialMute = storedMuted ? storedMuted === 'true' : true;
      const initialVolume = storedVolume ? parseFloat(storedVolume) : 1.0;
      
      setIsMuted(initialMute);
      setVolume(initialVolume);
      
      const video = videoRef.current;
      if (video) {
        video.muted = initialMute;
        video.volume = initialVolume;
      }
    } catch {
      // safe fallback
    }
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      if (mpegtsRef.current) mpegtsRef.current.pause();
      else video.pause();
      setIsPlaying(false);
      addLog('Stream paused by user.', 'info');
    } else {
      if (mpegtsRef.current) {
        const playPromise = mpegtsRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              addLog('Stream resumed by user.', 'info');
            })
            .catch((e: Error) => addLog(`Play action failed: ${e.message}`, 'error'));
        } else {
          setIsPlaying(true);
          addLog('Stream resumed by user.', 'info');
        }
      } else {
        video.play()
          .then(() => {
            setIsPlaying(true);
            addLog('Stream resumed by user.', 'info');
          })
          .catch((e: Error) => addLog(`Play action failed: ${e.message}`, 'error'));
      }
    }
  }, [isPlaying, addLog, mpegtsRef, videoRef]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
    }
    if (mpegtsRef.current) {
      mpegtsRef.current.volume = val;
      mpegtsRef.current.muted = val === 0;
    }
    setVolume(val);
    setIsMuted(val === 0);
    try {
      localStorage.setItem('cholostream_volume', String(val));
      localStorage.setItem('cholostream_muted', String(val === 0));
    } catch {
      // safe fallback
    }
  }, [mpegtsRef, videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    const nextMute = !isMuted;
    if (video) {
      video.muted = nextMute;
    }
    if (mpegtsRef.current) {
      mpegtsRef.current.muted = nextMute;
    }
    setIsMuted(nextMute);
    try {
      localStorage.setItem('cholostream_muted', String(nextMute));
    } catch {
      // safe fallback
    }
    addLog(nextMute ? 'Muted.' : 'Unmuted.', 'info');
  }, [isMuted, addLog, mpegtsRef, videoRef]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err: Error) => addLog(`Fullscreen failed: ${err.message}`, 'error'));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, [addLog, containerRef]);

  const togglePip = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (video.requestPictureInPicture) {
      video.requestPictureInPicture().catch((err: Error) => {
        addLog(`PiP failed: ${err.message}`, 'error');
      });
    }
  }, [addLog, videoRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'p':
          togglePip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, togglePip]);

  return {
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
    setIsMuted,
    isFullscreen,
    showControls,
    setShowControls,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    togglePip
  };
}
