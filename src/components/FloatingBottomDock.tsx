import React from 'react';
import { Home, Plus, Heart, User } from 'lucide-react';
import { NavTab } from './HeaderNav';

interface FloatingBottomDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mutualCount: number;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({
  activeTab,
  onSelectTab,
  mutualCount,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
      <div className="bg-[#1E2A38] text-white rounded-full p-2 flex items-center justify-around shadow-2xl border border-slate-700/50 backdrop-blur-md">
        <button
          onClick={() => onSelectTab('projects')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-white text-[#1E2A38] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Projects & Matches"
        >
          <Home className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('post-project')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
            activeTab === 'post-project'
              ? 'bg-white text-[#1E2A38] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Upload Project"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('spark')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer relative ${
            activeTab === 'spark'
              ? 'bg-white text-[#1E2A38] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Mutual Contacts"
        >
          <Heart className="w-4 h-4" />
          {mutualCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold font-mono flex items-center justify-center border border-[#1E2A38]">
              {mutualCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-[#1E2A38] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Profile & Schedule"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
