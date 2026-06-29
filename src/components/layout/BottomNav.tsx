import React from 'react';
import { Home, Tv, CalendarDays, Users, BarChart3 } from 'lucide-react';

export type TabType = 'channels' | 'scores' | 'schedule' | 'teams' | 'standings';

interface BottomNavProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs: { id: TabType; label: string; Icon: React.FC<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'channels', label: 'Home', Icon: Home },
    { id: 'scores',   label: 'Scores', Icon: Tv },
    { id: 'schedule', label: 'Schedule', Icon: CalendarDays },
    { id: 'teams',    label: 'Teams', Icon: Users },
    { id: 'standings',label: 'Standings', Icon: BarChart3 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container/95 backdrop-blur-md border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 space-y-0.5 transition-colors ${
                isActive ? 'text-secondary-fixed' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110 transition-transform' : ''}`}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary-fixed rounded-full shadow-[0_0_6px_rgba(195,244,0,0.9)]" />
                )}
              </div>
              <span className={`text-[9px] uppercase tracking-wide font-bold leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
