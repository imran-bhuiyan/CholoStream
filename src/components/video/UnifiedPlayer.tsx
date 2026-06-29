'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import type Hls from 'hls.js';
import type mpegts from 'mpegts.js';
import { StreamSource } from '@/types/stream';
import { usePlayerDiagnostics } from '@/hooks/usePlayerDiagnostics';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { LogEntry } from './player/types';
import { useStreamPlayer } from './player/useStreamPlayer';
import { usePlayerControls } from './player/usePlayerControls';
import { PlayerHUD } from './player/PlayerHUD';
import { PlayerLogs } from './player/PlayerLogs';

// HUD controls auto-hide delay
const HUD_HIDE_TIMEOUT_MS = 3000;

interface UnifiedPlayerProps {
  sources: StreamSource[];
  channelName: string;
  onAllSourcesExhausted?: () => void;
}

export default function UnifiedPlayer({ sources, channelName, onAllSourcesExhausted }: UnifiedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [hasAudioState, setHasAudioState] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [logCollapsed, setLogCollapsed] = useState(true);

  // Dynamic libraries references
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<mpegts.Player | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDestroyedRef = useRef<boolean>(false);

  const activeSource = sources[currentSourceIndex] || sources[0];
  const isExternalUrl = activeSource && (activeSource.url.startsWith('http://') || activeSource.url.startsWith('https://'));
  const streamUrl = activeSource
    ? (useProxy && isExternalUrl
        ? `/api/proxy?url=${encodeURIComponent(activeSource.url)}`
        : activeSource.url)
    : undefined;

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp: time, message, type }, ...prev.slice(0, 49)]);
  }, []);

  const selectNextSource = useCallback((reason: string) => {
    if (!useProxy) {
      addLog(`Playback issue: ${reason}. Retrying stream through CORS proxy...`, 'warn');
      setAlertMessage('Direct feed failed. Retrying through Serverless CORS Proxy...');
      setUseProxy(true);
      setTimeout(() => setAlertMessage(null), 4000);
    } else if (currentSourceIndex < sources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      addLog(`Switching to source ${nextIndex + 1}/${sources.length} due to: ${reason}`, 'warn');
      setAlertMessage(`Playback issues: Loading backup stream (${sources[nextIndex].codec})...`);
      setCurrentSourceIndex(nextIndex);
      setUseProxy(false); // start next source directly
      setHasAudioState(true);
      setTimeout(() => setAlertMessage(null), 4000);
    } else {
      addLog(`All available sources exhausted for this channel.`, 'error');
      setPlayerError(`Playback failed. ${reason}`);
      // Notify parent to auto-skip to next channel
      if (onAllSourcesExhausted) {
        setTimeout(() => onAllSourcesExhausted(), 2500);
      }
    }
  }, [addLog, currentSourceIndex, sources, useProxy, onAllSourcesExhausted]);

  const handleMpegtsAudioFallback = useCallback(() => {
    addLog('Audio decoder crash detected. Fallback to muted playback.', 'warn');
    setAlertMessage('Audio decoder issues. Muting audio engine to resume stream...');
    setHasAudioState(false);
    setTimeout(() => setAlertMessage(null), 4000);
  }, [addLog]);

  // 1. Diagnostics hook integration
  const { isStalled, errorState } = usePlayerDiagnostics({
    videoRef,
    codec: activeSource?.codec || 'AVC',
    onHevcStallDetected: useCallback((reason: string) => {
      addLog(`Telemetry trigger: HEVC stall verified.`, 'warn');
      selectNextSource(reason);
    }, [addLog, selectNextSource]),
    onDecoderError: useCallback((message: string) => {
      addLog(`Decoder pipeline crash: ${message}`, 'error');
      selectNextSource(message);
    }, [addLog, selectNextSource])
  });

  // Controls logic
  const controls = usePlayerControls({
    videoRef,
    containerRef,
    mpegtsRef,
    addLog
  });

  // Player initialization logic
  useStreamPlayer({
    videoRef,
    activeSource,
    streamUrl,
    hasAudioState,
    useProxy,
    isDestroyedRef,
    addLog,
    selectNextSource,
    handleMpegtsAudioFallback,
    setIsPlaying: controls.setIsPlaying,
    hlsRef,
    mpegtsRef,
    isMuted: controls.isMuted,
    setIsMuted: controls.setIsMuted
  });

  // HUD controls interactions
  const handleMouseMove = () => {
    controls.setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (controls.isPlaying) {
        controls.setShowControls(false);
      }
    }, HUD_HIDE_TIMEOUT_MS);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col w-full h-full bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => controls.isPlaying && controls.setShowControls(false)}
    >
      <div className="relative flex-1 bg-black/90 flex items-center justify-center overflow-hidden">
        {playerError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <AlertTriangle className="h-16 w-16 text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Stream Unavailable</h3>
            <p className="text-sm text-rose-200/80 mb-8 max-w-md">{playerError}</p>
            <button
              onClick={() => {
                setPlayerError(null);
                setCurrentSourceIndex(0);
                setHasAudioState(true);
                addLog('Manual player reload requested.', 'info');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-fixed hover:bg-secondary-fixed-dim text-on-secondary-fixed rounded-lg transition-colors font-medium text-sm shadow-lg shadow-secondary-fixed/30"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Stream</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
              muted
              onClick={controls.togglePlay}
            />

            {/* Live alerts / Loading states */}
            {(alertMessage || isStalled || errorState) && (
              <div className="absolute top-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-amber-500/35 text-amber-200 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-2xl animate-fade-in z-20">
                <RefreshCw className="h-5 w-5 text-amber-400 animate-spin" />
                <span className="text-sm font-semibold">
                  {alertMessage || errorState || 'Buffer stalled: Waiting for video frames to synchronize...'}
                </span>
              </div>
            )}

            <PlayerHUD
              showControls={controls.showControls}
              channelName={channelName}
              activeSource={activeSource}
              useProxy={useProxy}
              currentSourceIndex={currentSourceIndex}
              isPlaying={controls.isPlaying}
              isMuted={controls.isMuted}
              hasAudioState={hasAudioState}
              volume={controls.volume}
              isFullscreen={controls.isFullscreen}
              togglePlay={controls.togglePlay}
              toggleMute={controls.toggleMute}
              handleVolumeChange={controls.handleVolumeChange}
              togglePip={controls.togglePip}
              toggleFullscreen={controls.toggleFullscreen}
              setUseProxy={setUseProxy}
              addLog={addLog}
            />
          </>
        )}
      </div>

    </div>
  );
}
