'use client';

import React from 'react';

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
  return (
    <div className="min-h-screen flex flex-col bg-[#06070a] text-slate-100 font-sans">
      
      {/* Mobile-Only Sticky Player Header Wrapper */}
      <div className="lg:hidden sticky top-0 z-30 w-full bg-[#06070a] border-b border-slate-800 shadow-md">
        {player}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full max-w-[1920px] mx-auto">
        
        {/* Left Column: Channels List / Filters (desktop sidebar, mobile scroll item) */}
        <aside className="w-full lg:w-80 flex-shrink-0 bg-[#0a0c10] border-r border-slate-800/80 flex flex-col h-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 overflow-y-auto order-2 lg:order-1">
          {sidebar}
        </aside>

        {/* Central Stage: Player (desktop only), Live Scores, and Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto order-1 lg:order-2">
          
          {/* Desktop-Only Player Stage */}
          <div className="hidden lg:block w-full">
            {player}
          </div>

          {/* Scores Panel */}
          <div className="w-full">
            {scores}
          </div>

          {/* Mobile-Only Schedule (placed lower on mobile since player is sticky at top) */}
          <div className="lg:hidden w-full space-y-4">
            {schedule}
          </div>
        </main>

        {/* Right Column: Match Schedule (desktop sidebar only) */}
        <aside className="hidden lg:block w-96 flex-shrink-0 bg-[#0a0c10]/40 border-l border-slate-800/80 p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto order-3">
          {schedule}
        </aside>

      </div>
    </div>
  );
}
