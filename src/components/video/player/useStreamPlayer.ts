import { useEffect } from 'react';
import type Hls from 'hls.js';
import type { ErrorData } from 'hls.js';
import type mpegts from 'mpegts.js';
import { StreamSource } from '@/types/stream';

interface UseStreamPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  activeSource: StreamSource;
  streamUrl?: string;
  hasAudioState: boolean;
  useProxy: boolean;
  isDestroyedRef: React.MutableRefObject<boolean>;
  addLog: (message: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  selectNextSource: (reason: string) => void;
  handleMpegtsAudioFallback: () => void;
  setIsPlaying: (playing: boolean) => void;
  hlsRef: React.MutableRefObject<Hls | null>;
  mpegtsRef: React.MutableRefObject<mpegts.Player | null>;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export function useStreamPlayer({
  videoRef,
  activeSource,
  streamUrl,
  hasAudioState,
  useProxy,
  isDestroyedRef,
  addLog,
  selectNextSource,
  handleMpegtsAudioFallback,
  setIsPlaying,
  hlsRef,
  mpegtsRef,
  isMuted,
  setIsMuted,
}: UseStreamPlayerProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSource || !streamUrl) return;

    video.muted = isMuted;

    let localDestroyed = false;
    isDestroyedRef.current = false;

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
          if (localDestroyed) return;
          if (HlsClass.isSupported()) {
            const hls = new HlsClass({
              enableWorker: true,
              lowLatencyMode: true,
              // Larger buffer tolerates brief CDN hiccups (e.g. Caracol TV's Akamai origin)
              maxBufferLength: 8,
              maxMaxBufferLength: 16,
              maxBufferSize: 10 * 1024 * 1024,
              // Relaxed live-sync: stay further from the live edge to absorb jitter
              liveSyncDuration: 5,
              liveMaxLatencyDuration: 12,
              progressive: true,
              capLevelToPlayerSize: true,
              // Retry policies: 3 attempts with 500ms back-off before declaring fatal
              fragLoadPolicy: {
                default: {
                  maxTimeToFirstByteMs: 20000,
                  maxLoadTimeMs: 30000,
                  timeoutRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
                  errorRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
                },
              },
              manifestLoadPolicy: {
                default: {
                  maxTimeToFirstByteMs: 20000,
                  maxLoadTimeMs: 20000,
                  timeoutRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
                  errorRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
                },
              },
            });
            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
              if (localDestroyed) return;
              addLog('HLS.js: Stream loaded and parsed.', 'success');
              video.play()
                .then(() => setIsPlaying(true))
                .catch((e: Error) => {
                  addLog(`Play deferred: ${e.message}. Retrying muted...`, 'warn');
                  video.muted = true;
                  setIsMuted(true);
                  video.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => {});
                });
            });

            hls.on(HlsClass.Events.ERROR, (event: string, data: ErrorData) => {
              if (localDestroyed || !data.fatal) return;
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
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play()
                  .then(() => setIsPlaying(true))
                  .catch(() => {});
              });
          } else {
            selectNextSource('HLS unsupported on this client');
          }
        } else if (isMpegTs) {
          const mpegtsClass = (await import('mpegts.js')).default;
          if (localDestroyed) return;
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
              liveBufferLatencyMaxLatency: 2.0,
              autoCleanupSourceBuffer: true,
              autoCleanupMaxBackwardDuration: 4,
              autoCleanupMinBackwardDuration: 2,
              stashInitialSize: 32 * 1024,
            });
            mpegtsRef.current = player;

            player.attachMediaElement(video);
            player.load();

            const playPromise = player.play();
            if (playPromise) {
              playPromise
                .then(() => {
                  if (localDestroyed) return;
                  setIsPlaying(true);
                  addLog('MPEG-TS.js: Playback initialized.', 'success');
                })
                .catch((err: Error) => {
                  addLog(`MPEG-TS play failure: ${err.message}. Retrying muted...`, 'warn');
                  video.muted = true;
                  setIsMuted(true);
                  const retryPromise = player.play();
                  if (retryPromise) {
                    retryPromise
                      .then(() => setIsPlaying(true))
                      .catch(() => {});
                  } else {
                    setIsPlaying(true);
                  }
                });
            } else {
              setIsPlaying(true);
            }

            player.on(mpegtsClass.Events.ERROR, (errorType: string, errorDetails: string) => {
              if (localDestroyed) return;
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
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            });
        }
      } catch (err: unknown) {
        const error = err as Error;
        addLog(`Instantiation failure: ${error.message}`, 'error');
        selectNextSource('Instantiation exception');
      }
    };

    loadStream();

    return () => {
      localDestroyed = true;
      isDestroyedRef.current = true;
      cleanup();
    };
  }, [
    activeSource,
    streamUrl,
    hasAudioState,
    useProxy,
    addLog,
    handleMpegtsAudioFallback,
    selectNextSource,
    hlsRef,
    isDestroyedRef,
    mpegtsRef,
    setIsPlaying,
    videoRef,
    isMuted,
    setIsMuted,
  ]);
}
