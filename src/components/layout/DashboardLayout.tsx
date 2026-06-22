'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  player: React.ReactNode;
  schedule: React.ReactNode;
  scores: React.ReactNode;
}

export default function DashboardLayout({
  sidebar,
  player,
  schedule,
  scores
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[2200px] mx-auto min-h-screen w-full">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg shadow-violet-600/30 transition-all duration-200 active:scale-95"
        aria-label={sidebarOpen ? 'Close channels' : 'Open channels'}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 auto-rows-max">
        
        {/* Main Player - Prominent top-left positioning */}
        <section className="col-span-1 lg:col-span-8 lg:row-span-2 bento-card bg-black flex flex-col relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {player}
        </section>

        {/* Right Sidebar - Channels List */}
        <aside className={`
          col-span-1 lg:col-span-4 lg:row-span-3 bento-card p-2 md:p-4 overflow-y-auto scrollbar-thin
          lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 lg:z-0
          ${sidebarOpen
            ? 'fixed inset-y-0 right-0 w-[85vw] max-w-sm z-50 animate-slide-in-right h-full rounded-l-2xl'
            : 'hidden lg:block'
          }
        `}>
          <div className="lg:hidden flex items-center justify-between mb-3 px-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Channels</span>
            <button onClick={closeSidebar} className="p-1 text-slate-500 hover:text-white" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          {sidebar}
        </aside>

        {/* Live Scores Bento Box */}
        <section className="col-span-1 lg:col-span-4 bento-card p-4 md:p-6 overflow-hidden flex flex-col min-h-[300px]">
          {scores}
        </section>

        {/* Schedule Bento Box */}
        <section className="col-span-1 lg:col-span-4 bento-card p-4 md:p-6 overflow-hidden flex flex-col min-h-[300px]">
          {schedule}
        </section>

      </div>
    </div>
  );
}
