'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';
import type { ErrorData } from 'hls.js';
import type mpegts from 'mpegts.js';
import { StreamSource } from '@/types/stream';
import { usePlayerDiagnostics } from '@/hooks/usePlayerDiagnostics';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Tv, RefreshCw, AlertTriangle, Cpu, Activity,
  Globe
} from 'lucide-react';

interface UnifiedPlayerProps {
  sources: StreamSource[];
  channelName: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

export default function UnifiedPlayer({ sources, channelName }: UnifiedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAudioState, setHasAudioState] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Dynamic libraries references
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<mpegts.Player | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  }, [addLog, currentSourceIndex, sources, useProxy]);

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
    onHevcStallDetected: (reason: string) => {
      addLog(`Telemetry trigger: HEVC stall verified.`, 'warn');
      selectNextSource(reason);
    },
    onDecoderError: (message: string) => {
      addLog(`Decoder pipeline crash: ${message}`, 'error');
      selectNextSource(message);
    }
  });

  // 2. Playback engines loading & setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSource || !streamUrl) return;

    let isDestroyed = false;

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (mpegtsRef.current) {
        mpegtsRef.current.pause();
        mpegtsRef.current.unload();
        mpegtsRef.current.detachMediaElement();
        mpegtsRef.current.destroy();
        mpegtsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };

    cleanup();

    const isM3u8 = activeSource.url.includes('.m3u8');
    const isMpegTs = activeSource.codec === 'MPEGTS' || activeSource.url.includes('.ts');

    addLog(`Initializing stream: ${useProxy ? 'PROXIED -> ' : ''}${activeSource.url} (${activeSource.codec})`, 'info');

    // HEVC browser pre-check
    if (activeSource.codec === 'HEVC') {
      const checkHevcSupport = (): boolean => {
        if (typeof window === 'undefined') return true;
        const mse = 'MediaSource' in window && MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L93.B0"');
        const native = video.canPlayType('video/mp4; codecs="hvc1"') !== '';
        return mse || native;
      };

      if (!checkHevcSupport()) {
        addLog('Browser lacks HEVC video layer support. Skipping codec.', 'warn');
        selectNextSource('HEVC codec unsupported');
        return;
      }
    }

    const loadStream = async () => {
      try {
        if (isM3u8) {
          const HlsClass = (await import('hls.js')).default;
          if (HlsClass.isSupported()) {
            const hls = new HlsClass({
              maxBufferLength: 8,
              maxMaxBufferLength: 15,
              enableWorker: true,
              lowLatencyMode: true,
            });
            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
              if (isDestroyed) return;
              addLog('HLS.js: Stream loaded and parsed.', 'success');
              video.play()
                .then(() => setIsPlaying(true))
                .catch((e: Error) => addLog(`Play deferred: ${e.message}`, 'warn'));
            });

            hls.on(HlsClass.Events.ERROR, (event: string, data: ErrorData) => {
              if (isDestroyed || !data.fatal) return;
              addLog(`HLS error: ${data.details}`, 'error');
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                  selectNextSource(`Fatal HLS network error: ${data.details}`);
                  break;
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  addLog('Recovering from media error...', 'warn');
                  hls.recoverMediaError();
                  break;
                default:
                  selectNextSource(`Fatal HLS: ${data.details}`);
                  break;
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            addLog('HLS.js unavailable. Using native safari player.', 'info');
            video.src = streamUrl;
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            selectNextSource('HLS unsupported on this client');
          }
        } else if (isMpegTs) {
          const mpegtsClass = (await import('mpegts.js')).default;
          if (mpegtsClass.getFeatureList().mseLivePlayback) {
            addLog(`MPEG-TS: Loading MSE player (Audio: ${hasAudioState ? 'ON' : 'OFF'})`, 'info');
            
            const player = mpegtsClass.createPlayer({
              type: 'mse',
              url: streamUrl,
              isLive: true,
              hasAudio: true,
            }, {
              enableStashBuffer: false,
              liveBufferLatencyChasing: true,
            });
            mpegtsRef.current = player;

            player.attachMediaElement(video);
            player.load();

            const playPromise = player.play();
            if (playPromise) {
              playPromise
                .then(() => {
                  if (isDestroyed) return;
                  setIsPlaying(true);
                  addLog('MPEG-TS.js: Playback initialized.', 'success');
                })
                .catch((err: Error) => {
                  addLog(`MPEG-TS play failure: ${err.message}`, 'warn');
                });
            } else {
              setIsPlaying(true);
            }

            player.on(mpegtsClass.Events.ERROR, (errorType: string, errorDetails: string) => {
              if (isDestroyed) return;
              addLog(`MPEG-TS error: ${errorType} (${errorDetails})`, 'error');

              if (hasAudioState && (
                errorType === mpegtsClass.ErrorTypes.MEDIA_ERROR ||
                errorDetails.includes('audio') ||
                errorDetails.includes('decode')
              )) {
                cleanup();
                handleMpegtsAudioFallback();
              } else {
                selectNextSource(`MPEG-TS crash: ${errorDetails}`);
              }
            });
          } else {
            selectNextSource('MPEG-TS MSE unsupported');
          }
        } else {
          video.src = streamUrl;
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } catch (err: unknown) {
        const error = err as Error;
        addLog(`Instantiation failure: ${error.message}`, 'error');
        selectNextSource('Instantiation exception');
      }
    };

    loadStream();

    return () => {
      isDestroyed = true;
      cleanup();
    };
  }, [currentSourceIndex, activeSource, streamUrl, hasAudioState, useProxy, addLog, handleMpegtsAudioFallback, selectNextSource]);

  // HUD controls interactions
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const togglePlay = () => {
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
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const nextMute = !isMuted;
    if (video) {
      video.muted = nextMute;
    }
    if (mpegtsRef.current) {
      mpegtsRef.current.muted = nextMute;
    }
    setIsMuted(nextMute);
    addLog(nextMute ? 'Muted.' : 'Unmuted.', 'info');
  };

  const toggleFullscreen = () => {
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
  };

  const togglePip = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (video.requestPictureInPicture) {
      video.requestPictureInPicture().catch((err: Error) => {
        addLog(`PiP failed: ${err.message}`, 'error');
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="flex flex-col w-full bg-[#0d0f14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 hover:border-violet-500/30"
    >
      {/* Video element container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center group">
        {playerError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 z-20">
            <AlertTriangle className="h-16 w-16 text-rose-500 animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-200">Playback Blocked</h3>
              <p className="text-sm text-slate-400 max-w-md">{playerError}</p>
            </div>
            <button
              onClick={() => {
                setPlayerError(null);
                setCurrentSourceIndex(0);
                setHasAudioState(true);
                addLog('Manual player reload requested.', 'info');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-violet-600/30"
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
              onClick={togglePlay}
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

            {/* Custom HUD Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 flex flex-col justify-between p-4 z-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              {/* Top Badge bar */}
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-slate-200 border border-slate-800">
                  {channelName}
                </span>

                <div className="flex space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center border ${
                    activeSource?.codec === 'HEVC' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : activeSource?.codec === 'MPEGTS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <Cpu className="h-3 w-3 mr-1" />
                    <span>{activeSource?.codec || 'AVC'}</span>
                  </span>

                  {useProxy && (
                    <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full text-[10px] font-bold flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-violet-400" />
                      Proxy Active
                    </span>
                  )}

                  {currentSourceIndex > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-bold">
                      Fallback Active
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom HUD controls bar */}
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800/60">
                
                {/* Play, Pause & Volume HUD section */}
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:text-violet-400 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                    aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleMute}
                      className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
                      aria-label="Toggle mute"
                    >
                      {isMuted || !hasAudioState ? <VolumeX className="h-4.5 w-4.5 text-rose-400" /> : <Volume2 className="h-4.5 w-4.5" />}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 md:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none"
                    />
                  </div>

                  {!hasAudioState && (
                    <span className="text-[10px] text-rose-350 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Muted Recovery
                    </span>
                  )}
                </div>

                {/* Info status & Fullscreen buttons */}
                <div className="flex items-center space-x-3">
                  {/* Glowing latency status indicator */}
                  <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 rounded-md px-2.5 py-0.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">LIVE</span>
                  </div>

                  <button
                    onClick={() => {
                      const nextProxy = !useProxy;
                      setUseProxy(nextProxy);
                      addLog(`User manually ${nextProxy ? 'enabled' : 'disabled'} Serverless CORS Proxy.`, 'info');
                    }}
                    className={`p-1.5 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                      useProxy 
                        ? 'text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                    title={useProxy ? "CORS Proxy: Enabled" : "CORS Proxy: Disabled (Direct)"}
                  >
                    <Globe className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={togglePip}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors hidden sm:block"
                    title="Picture in Picture"
                  >
                    <Tv className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-4.5 w-4.5" /> : <Maximize className="h-4.5 w-4.5" />}
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* Real-time debugging and telemetry logs output block */}
      <div className="border-t border-slate-800 bg-[#07080c] p-4 flex flex-col min-h-[140px] max-h-[180px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-900">
          <div className="flex items-center space-x-2 text-slate-350">
            <Activity className="h-4 w-4 text-violet-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Stream Telemetry & logs</h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Active Source: {currentSourceIndex + 1}/{sources.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Initializing media player controls...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex space-x-2 leading-relaxed">
                <span className="text-slate-600">[{log.timestamp}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-450' :
                  log.type === 'warn' ? 'text-amber-400' :
                  log.type === 'error' ? 'text-rose-400 font-semibold' : 'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
