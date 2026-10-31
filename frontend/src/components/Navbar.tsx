import React from 'react';
import { NavigationTab } from '../types';
import {
  Compass,
  Sparkles,
  Layers,
  Mic,
  Briefcase,
  TrendingUp,
  Cpu,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  targetRole: string;
  candidateName: string;
  overallReadiness: number;
  apiStatus: string;
  onOpenProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  targetRole,
  candidateName,
  overallReadiness,
  apiStatus,
  onOpenProfileModal
}) => {
  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; isPrimaryFeature?: boolean; badge?: string }> = [
    {
      id: 'profile',
      label: 'Profile & Skill Gaps',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Projects',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'interviews',
      label: 'Mock Interviews',
      icon: <Mic className="w-4 h-4" />,
      isPrimaryFeature: true,
      badge: 'VOICE AI'
    },
    {
      id: 'progress',
      label: 'Progress & Applications',
      icon: <Briefcase className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="relative group cursor-pointer" onClick={() => onTabChange('profile')}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/30 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-white transform group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-navy-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Pivot Pilot
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Agentic AI
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                Turn career ambition into measurable progress.
              </p>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  } ${item.isPrimaryFeature && !isActive ? 'ring-1 ring-violet-500/30 bg-violet-950/20 text-violet-200 hover:bg-violet-900/30' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-violet-500/25 text-violet-300 border border-violet-400/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Readiness Quick Summary */}
          <div className="flex items-center space-x-3">
            {/* API Status Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'ok' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
              <span>{apiStatus === 'ok' ? 'FastAPI Connected' : 'Local AI Mode'}</span>
            </div>

            {/* Candidate Role Switcher Pill */}
            <button
              onClick={onOpenProfileModal}
              title="Click to edit candidate profile or target role"
              className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-violet-500/30 hover:border-violet-400 hover:bg-slate-850 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-700 to-indigo-800 flex items-center justify-center text-xs font-bold text-white border border-violet-400/40">
                {candidateName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    {candidateName}
                  </span>
                  <span className="text-[10px] text-violet-300 font-mono font-bold bg-violet-950/80 px-1.5 rounded border border-violet-800">
                    {overallReadiness}% Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-[170px] truncate group-hover:text-violet-300 transition-colors">
                  🎯 {targetRole}
                </p>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg text-[11px] font-medium transition-colors ${
                currentTab === item.id ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="p-1 rounded-md bg-slate-900 border border-slate-800 mb-1">
                {item.icon}
              </span>
              <span>{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

