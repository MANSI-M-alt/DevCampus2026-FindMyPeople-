import React from 'react';
import { YELLOW_STAR_3D } from '../assets/images';
import { Sparkles, PlayCircle, Users } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeroChallengeCardProps {
  profiles: StudentProfile[];
  onStartDemo: () => void;
  isDarkMode: boolean;
}

export const HeroChallengeCard: React.FC<HeroChallengeCardProps> = ({
  profiles,
  onStartDemo,
  isDarkMode,
}) => {
  return (
    <div
      className={`relative rounded-[32px] p-6 sm:p-7 transition-all overflow-hidden shadow-xl ${
        isDarkMode
          ? 'bg-gradient-to-r from-[#181826] via-[#1E1F30] to-[#25273C] text-white border border-slate-800'
          : 'bg-gradient-to-r from-[#C6B7FF] via-[#D3C7FF] to-[#E0D6FF] text-slate-900 border border-purple-200/60'
      }`}
    >
      {/* Background Decorative Soft Blur */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left Column Text & Avatars */}
        <div className="space-y-3 max-w-[62%]">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              Daily Match
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-80 leading-snug">
              Do your plan before 08:00 AM
            </p>
          </div>

          {/* Avatar Pile + Pill Badge matching the design image */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex -space-x-2.5 overflow-hidden">
              {profiles.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-purple-100 object-cover"
                />
              ))}
            </div>

            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-black/80 dark:bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
              +{profiles.length - 3}
            </span>
          </div>

          {/* Quick Demo Trigger */}
          <div className="pt-2">
            <button
              onClick={onStartDemo}
              className={`px-4 py-2 rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                isDarkMode
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Run Interactive Demo</span>
            </button>
          </div>
        </div>

        {/* Right Column: Floating 3D Yellow Star Flower Graphic */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-2xl animate-bounce-subtle">
            <img
              src={YELLOW_STAR_3D}
              alt="3D Yellow Star Graphic"
              className="w-full h-full object-contain filter drop-shadow-xl hover:rotate-12 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
