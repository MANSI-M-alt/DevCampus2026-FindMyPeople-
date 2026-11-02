import React from 'react';
import { StudentProfile } from '../types';
import { User, Users, Plus, Sparkles, Layers, ChevronDown, GraduationCap } from 'lucide-react';

export type NavTab = 'projects' | 'phd' | 'post-project' | 'profile' | 'spark';

interface HeaderNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profiles: StudentProfile[];
  activeUserId: string;
  onSelectActiveUser: (userId: string) => void;
  mutualCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  profiles,
  activeUserId,
  onSelectActiveUser,
  mutualCount,
}) => {
  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const isPhdActive = activeUser.isPhdCandidate || activeUser.year === 'PhD';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Left: Brand Logo & Campus Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => onSelectTab('projects')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#1E2A38] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-slate-800 transition">
                <Users className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#1E2A38] font-mono block leading-none">
                  FindMyPeople
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-400 block uppercase">
                  COLLABORATION DISCOVERY
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Nav Tabs (Properly Spaced & Compact Padding) */}
          <nav className="hidden lg:flex items-center gap-2 font-mono text-xs font-bold">
            <button
              onClick={() => onSelectTab('projects')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#1E2A38] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Projects & Matches
            </button>

            <button
              onClick={() => onSelectTab('phd')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'phd'
                  ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/70 bg-purple-50 border-purple-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>PhD Scholars Hub</span>
            </button>

            <button
              onClick={() => onSelectTab('spark')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'spark'
                  ? 'bg-[#1E2A38] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Mutual Contacts</span>
              {mutualCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                  {mutualCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#1E2A38] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Profile & Schedule
            </button>
          </nav>

          {/* Right: Active User Perspective Pill & Upload Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Perspective Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer hover:bg-slate-100 transition">
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase leading-tight">VIEWING AS</span>
                    {isPhdActive && (
                      <span className="text-[9px] px-1 bg-purple-100 text-purple-900 rounded font-bold">PhD</span>
                    )}
                  </div>
                  <span className="font-bold text-[#1E2A38] block leading-tight">{activeUser.name.split(' ')[0]}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 animate-in fade-in duration-150 font-mono">
                <div className="text-[10px] text-slate-400 font-bold px-3 py-1.5 uppercase border-b border-slate-100 flex items-center justify-between">
                  <span>SELECT PERSPECTIVE ({profiles.length})</span>
                  <span className="text-purple-900">INCL. PHD SCHOLARS</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-0.5 pt-1">
                  {profiles.map((p) => {
                    const pIsPhd = p.isPhdCandidate || p.year === 'PhD';
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectActiveUser(p.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          p.id === activeUserId
                            ? 'bg-[#1E2A38] text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {pIsPhd && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${p.id === activeUserId ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-900'}`}>
                                PhD
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${p.id === activeUserId ? 'text-slate-300' : 'text-slate-400'}`}>
                            {p.department.split(' ')[0]} · {p.year}
                          </div>
                        </div>
                        {p.id === activeUserId && <span className="text-[10px] font-bold">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => onSelectTab('post-project')}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E2A38] text-white font-mono text-xs font-bold transition hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UPLOAD PROJECT</span>
            </button>
          </div>
        </div>

        {/* Medium/Mobile Nav Tabs fallback */}
        <div className="flex lg:hidden items-center justify-around border-t border-slate-100 py-2 font-mono text-xs font-bold gap-1">
          <button
            onClick={() => onSelectTab('projects')}
            className={`px-2.5 py-1 rounded-lg transition ${activeTab === 'projects' ? 'bg-[#1E2A38] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Projects
          </button>
          <button
            onClick={() => onSelectTab('phd')}
            className={`px-2.5 py-1 rounded-lg transition border ${activeTab === 'phd' ? 'bg-purple-900 text-white border-purple-900' : 'bg-purple-50 text-purple-900 border-purple-200'}`}
          >
            PhD Hub
          </button>
          <button
            onClick={() => onSelectTab('spark')}
            className={`px-2.5 py-1 rounded-lg transition ${activeTab === 'spark' ? 'bg-[#1E2A38] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Mutual ({mutualCount})
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`px-2.5 py-1 rounded-lg transition ${activeTab === 'profile' ? 'bg-[#1E2A38] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
