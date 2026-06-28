import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Tv, Globe, Cpu } from 'lucide-react';
import { StreamSource } from '@/types/stream';

interface PlayerHUDProps {
  showControls: boolean;
  channelName: string;
  activeSource: StreamSource;
  useProxy: boolean;
  currentSourceIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  hasAudioState: boolean;
  volume: number;
  isFullscreen: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePip: () => void;
  toggleFullscreen: () => void;
  setUseProxy: (useProxy: boolean) => void;
  addLog: (message: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export function PlayerHUD({
  showControls,
  channelName,
  activeSource,
  useProxy,
  currentSourceIndex,
  isPlaying,
  isMuted,
  hasAudioState,
  volume,
  isFullscreen,
  togglePlay,
  toggleMute,
  handleVolumeChange,
  togglePip,
  toggleFullscreen,
  setUseProxy,
  addLog
}: PlayerHUDProps) {
  return (
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
  );
}
