'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UsePlayerDiagnosticsProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  codec: string;
  onHevcStallDetected: (reason: string) => void;
  onDecoderError: (message: string) => void;
}

export function usePlayerDiagnostics({
  videoRef,
  codec,
  onHevcStallDetected,
  onDecoderError,
}: UsePlayerDiagnosticsProps) {
  const [isStalled, setIsStalled] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const lastTimeRef = useRef<number>(0);
  const lastFrameCountRef = useRef<number>(0);
  const consecutiveStallsRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setErrorState(null);
    setIsStalled(false);
    lastTimeRef.current = 0;
    lastFrameCountRef.current = 0;
    consecutiveStallsRef.current = 0;

    // 1. Listen to Native HTML5 Media Errors
    const handleErrorEvent = () => {
      const mediaError = video.error;
      if (mediaError) {
        let errorMsg = 'An unknown media playback error occurred.';
        switch (mediaError.code) {
          case mediaError.MEDIA_ERR_ABORTED:
            errorMsg = 'Playback aborted by the user or client.';
            break;
          case mediaError.MEDIA_ERR_NETWORK:
            errorMsg = 'A network error caused the media download to fail.';
            break;
          case mediaError.MEDIA_ERR_DECODE:
            errorMsg = 'A fatal decoder error occurred. Stream corrupted or format unsupported.';
            onDecoderError(errorMsg);
            break;
          case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'The video stream format or codec is not supported by your browser.';
            onDecoderError(errorMsg);
            break;
        }
        setErrorState(errorMsg);
      }
    };

    // 2. Playback Stalling Listeners
    const handleStalledEvent = () => {
      setIsStalled(true);
    };

    const handlePlayingEvent = () => {
      setIsStalled(false);
    };

    video.addEventListener('error', handleErrorEvent);
    video.addEventListener('stalled', handleStalledEvent);
    video.addEventListener('waiting', handleStalledEvent);
    video.addEventListener('playing', handlePlayingEvent);

    // 3. Telemetry Codec Monitor Loop (especially for HEVC)
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      if (video.paused || video.ended) return;

      const currentTime = video.currentTime;
      let currentFrameCount = 0;

      // Type-safe frame retrieval
      if (typeof video.getVideoPlaybackQuality === 'function') {
        currentFrameCount = video.getVideoPlaybackQuality().totalVideoFrames;
      } else if ('webkitDecodedFrameCount' in video) {
        currentFrameCount = (video as unknown as { webkitDecodedFrameCount: number }).webkitDecodedFrameCount;
      }

      if (currentTime > lastTimeRef.current) {
        // Playback has advanced in timeline
        if (currentFrameCount === lastFrameCountRef.current) {
          consecutiveStallsRef.current++;
          
          if (consecutiveStallsRef.current >= 3) {
            setIsStalled(true);
            onHevcStallDetected(`HEVC Codec Stall: Time is advancing (${currentTime.toFixed(1)}s) but decoded frames count is frozen at ${currentFrameCount}.`);
            consecutiveStallsRef.current = 0; // reset to prevent spamming
          }
        } else {
          setIsStalled(false);
          consecutiveStallsRef.current = 0;
        }
      }

      lastTimeRef.current = currentTime;
      lastFrameCountRef.current = currentFrameCount;
    }, 2000);

    return () => {
      video.removeEventListener('error', handleErrorEvent);
      video.removeEventListener('stalled', handleStalledEvent);
      video.removeEventListener('waiting', handleStalledEvent);
      video.removeEventListener('playing', handlePlayingEvent);
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [videoRef, codec, onHevcStallDetected, onDecoderError]);

  return {
    isStalled,
    errorState,
  };
}
