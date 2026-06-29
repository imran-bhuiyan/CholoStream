'use client';

import React, { useState } from 'react';
import BottomNav, { TabType } from './BottomNav';
import TeamsPanel from '@/components/teams/TeamsPanel';
import StandingsPanel from '@/components/standings/StandingsPanel';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  player: React.ReactNode;
  schedule: React.ReactNode;
  scores: React.ReactNode;
}

type DesktopPanel = 'teams' | 'standings' | null;

export default function DashboardLayout({
  sidebar,
  player,
  schedule,
  scores
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const [desktopPanel, setDesktopPanel] = useState<DesktopPanel>(null);
  const [activeDesktopTab, setActiveDesktopTab] = useState<'scores' | 'schedule'>('scores');

  const togglePanel = (panel: DesktopPanel) => {
    setDesktopPanel(prev => (prev === panel ? null : panel));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">

      {/* ── TOP NAV (Desktop) ──────────────────────────────────────────── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-10 bg-background/80 backdrop-blur-xl border-b border-white/10">
        {/* Brand */}
        <a href="#" className="flex items-center gap-0">
          <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Cholo</span>
          <span className="font-headline-lg text-headline-lg text-secondary-fixed tracking-tight">Stream</span>
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setDesktopPanel(null)}
            className="font-label-caps text-label-caps text-secondary-fixed border-b-2 border-secondary-fixed pb-0.5 uppercase tracking-widest transition-all"
          >
            STREAM
          </button>
          <button
            onClick={() => togglePanel('teams')}
            className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors pb-0.5 border-b-2 ${
              desktopPanel === 'teams'
                ? 'text-secondary-fixed border-secondary-fixed'
                : 'text-on-surface-variant hover:text-secondary-fixed border-transparent'
            }`}
          >
            TEAMS
          </button>
          <button
            onClick={() => togglePanel('standings')}
            className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors pb-0.5 border-b-2 ${
              desktopPanel === 'standings'
                ? 'text-secondary-fixed border-secondary-fixed'
                : 'text-on-surface-variant hover:text-secondary-fixed border-transparent'
            }`}
          >
            STANDINGS
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={() => setDesktopPanel(null)}
          className="font-label-caps text-label-caps uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-6 py-2 rounded shimmer-hover transition-colors shadow-[0_0_20px_rgba(195,244,0,0.25)]"
        >
          WATCH LIVE
        </button>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <header className="pt-4 pb-3 px-4 md:pt-24 md:pb-6 md:px-10 mt-16 md:mt-0">
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-secondary-fixed uppercase leading-none tracking-tight">
          THE WORLD IS WATCHING.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 hidden md:block max-w-2xl">
          Stream live World Cup 2026 coverage — every match, every goal, every moment of glory.
        </p>
      </header>

      {/* ── DESKTOP OVERLAY PANELS (Teams / Standings) ─────────────────── */}
      {desktopPanel && (
        <div className="hidden md:block fixed inset-0 z-40 top-16">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setDesktopPanel(null)}
          />
          {/* Slide-in panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl xl:max-w-4xl glass-panel border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                {desktopPanel === 'teams' ? 'All 48 Teams · FIFA World Cup 2026™' : 'Group Stage Standings · FIFA World Cup 2026™'}
              </span>
              <button
                onClick={() => setDesktopPanel(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
              {desktopPanel === 'teams' ? <TeamsPanel /> : <StandingsPanel />}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN DASHBOARD GRID ───────────────────────────────────────── */}
      <main className="flex-1 px-0 md:px-10 pb-20 md:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 lg:items-start">

          {/* Left column: Player + Scores + Schedule */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Player */}
            <section className="w-full bg-black border-b border-white/10 lg:border lg:rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)] aspect-video">
              {player}
            </section>

            {/* Desktop: Scores + Schedule Tabbed View below player */}
            <div className="hidden lg:block glass-panel rounded-xl overflow-hidden shadow-lg border border-white/5">
              {/* Tab Headers */}
              <div className="flex border-b border-white/5 bg-[#121316]/50">
                <button
                  onClick={() => setActiveDesktopTab('scores')}
                  className={`flex items-center gap-2 px-6 py-4 font-label-caps text-label-caps tracking-widest transition-all border-b-2 uppercase ${
                    activeDesktopTab === 'scores'
                      ? 'text-secondary-fixed border-secondary-fixed bg-secondary-fixed/5'
                      : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/5'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
                  </span>
                  LIVE SCORES
                </button>
                <button
                  onClick={() => setActiveDesktopTab('schedule')}
                  className={`px-6 py-4 font-label-caps text-label-caps tracking-widest transition-all border-b-2 uppercase ${
                    activeDesktopTab === 'schedule'
                      ? 'text-secondary-fixed border-secondary-fixed bg-secondary-fixed/5'
                      : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/5'
                  }`}
                >
                  MATCH SCHEDULE
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 overflow-y-auto max-h-[500px] no-scrollbar">
                {activeDesktopTab === 'scores' ? scores : schedule}
              </div>
            </div>
          </div>

          {/* Right column: Channels sidebar */}
          <aside
            className="hidden lg:flex lg:col-span-4 flex-col glass-panel rounded-xl overflow-hidden lg:sticky lg:top-8"
            style={{ height: 'calc(100vh - 6rem)' }}
          >
            <div className="px-5 pt-5 pb-3 border-b border-white/5 flex-shrink-0">
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">LIVE CHANNELS</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {sidebar}
            </div>
          </aside>

        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────── */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* ── MOBILE TAB PANELS ─────────────────────────────────────────── */}
      <div className="lg:hidden">
        {/* Channels */}
        <section className={`px-4 pb-24 ${activeTab === 'channels' ? 'block' : 'hidden'}`}>
          <div className="py-3 mb-2 border-b border-white/5">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">LIVE CHANNELS</span>
          </div>
          {sidebar}
        </section>

        {/* Scores */}
        <section className={`px-4 pb-24 ${activeTab === 'scores' ? 'block' : 'hidden'}`}>
          <div className="py-3 mb-3 border-b border-white/5 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
            </span>
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">LIVE SCORES</span>
          </div>
          {scores}
        </section>

        {/* Schedule */}
        <section className={`px-4 pb-24 ${activeTab === 'schedule' ? 'block' : 'hidden'}`}>
          <div className="py-3 mb-3 border-b border-white/5">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">MATCH SCHEDULE</span>
          </div>
          {schedule}
        </section>

        {/* Teams */}
        <section className={`px-4 pb-24 ${activeTab === 'teams' ? 'block' : 'hidden'}`}>
          <div className="py-3 mb-3">
            {/* TeamsPanel has its own header */}
            <TeamsPanel />
          </div>
        </section>

        {/* Standings */}
        <section className={`px-4 pb-24 ${activeTab === 'standings' ? 'block' : 'hidden'}`}>
          <div className="py-3 mb-3">
            {/* StandingsPanel has its own header */}
            <StandingsPanel />
          </div>
        </section>
      </div>
    </div>
  );
}
