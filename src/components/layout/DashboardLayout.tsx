'use client';

import React, { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'channels' | 'scores' | 'schedule'>('channels');

  return (
    <div className="p-0 md:p-6 lg:p-8 max-w-[2200px] mx-auto min-h-screen w-full flex flex-col lg:block">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 auto-rows-max flex-1">
        
        {/* Main Player - Sticky on mobile */}
        <section className="col-span-1 lg:col-span-8 lg:row-span-2 bento-card bg-black flex flex-col relative z-30 lg:z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] sticky top-16 lg:static rounded-none lg:rounded-2xl">
          {player}
        </section>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex bg-[#121620] border-b border-white/5 sticky top-[calc(4rem+56.25vw)] z-20">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'channels' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'scores' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Scores
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'schedule' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Schedule
          </button>
        </div>

        {/* Right Sidebar - Channels List */}
        <aside className={`
          col-span-1 lg:col-span-4 lg:row-span-3 bento-card overflow-y-auto scrollbar-thin p-0 lg:p-4
          lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 lg:z-0 rounded-none lg:rounded-2xl
          ${activeTab === 'channels' ? 'block' : 'hidden lg:block'}
        `}>
          <div className="hidden lg:flex items-center justify-between mb-3 px-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Channels</span>
          </div>
          <div className="p-4 lg:p-0">
            {sidebar}
          </div>
        </aside>

        {/* Live Scores Bento Box */}
        <section className={`col-span-1 lg:col-span-4 bento-card p-4 md:p-6 overflow-hidden flex-col min-h-[300px] rounded-none lg:rounded-2xl ${activeTab === 'scores' ? 'flex' : 'hidden lg:flex'}`}>
          {scores}
        </section>

        {/* Schedule Bento Box */}
        <section className={`col-span-1 lg:col-span-4 bento-card p-4 md:p-6 overflow-hidden flex-col min-h-[300px] rounded-none lg:rounded-2xl ${activeTab === 'schedule' ? 'flex' : 'hidden lg:flex'}`}>
          {schedule}
        </section>

      </div>
    </div>
  );
}
