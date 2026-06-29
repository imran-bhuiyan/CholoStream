import React from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { LogEntry } from './types';

interface PlayerLogsProps {
  logs: LogEntry[];
  logCollapsed: boolean;
  setLogCollapsed: (collapsed: boolean) => void;
  setLogs: (logs: LogEntry[]) => void;
  currentSourceIndex: number;
  totalSources: number;
}

export function PlayerLogs({
  logs,
  logCollapsed,
  setLogCollapsed,
  setLogs,
  currentSourceIndex,
  totalSources
}: PlayerLogsProps) {
  return (
    <div className={`border-t border-white/5 bg-black/40 backdrop-blur-md flex flex-col transition-all duration-300 ${logCollapsed ? 'min-h-[40px]' : 'min-h-[140px] max-h-[180px]'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <button
          onClick={() => setLogCollapsed(!logCollapsed)}
          className="flex items-center space-x-2 text-slate-350 hover:text-white transition-colors"
        >
          <Activity className="h-4 w-4 text-secondary-fixed" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Stream Telemetry & logs</h4>
          {logCollapsed ? <ChevronDown className="h-3 w-3 text-slate-500" /> : <ChevronUp className="h-3 w-3 text-slate-500" />}
        </button>
        <div className="flex items-center space-x-3">
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors font-mono"
            >
              Clear
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-mono">Source {currentSourceIndex + 1}/{totalSources}</span>
        </div>
      </div>

      {!logCollapsed && (
        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] p-4 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
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
      )}
    </div>
  );
}
