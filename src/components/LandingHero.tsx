import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onStartDemo: () => void;
  onPostProject: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartDemo, onPostProject }) => {
  return (
    <div className="bg-[#EAE8D0] text-[#2A1F18] border border-[#2A1F18]/15 rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
      {/* Subtitle */}
      <div className="font-mono text-[11px] tracking-[0.2em] text-[#2A1F18]/70 uppercase font-bold text-center sm:text-left">
        WELCOME TO THE WORLD OF...
      </div>

      {/* Main Editorial Headline */}
      <h1 className="font-serif italic text-3xl sm:text-5xl font-normal leading-relaxed text-[#2A1F18] text-center sm:text-left max-w-2xl">
        all things good for the soul— art— kindness— exploring— intentional design— sunsets— memories & happy vibes...
      </h1>

      {/* Stamp Badges matching the oval outline stamps in the reference image */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        <span className="px-4 py-1.5 rounded-full border border-[#2A1F18]/40 font-mono text-[10px] tracking-[0.15em] text-[#2A1F18] uppercase font-bold bg-[#E2DDD0]">
          ( INTERDISCIPLINARY MATCHING GOODNESS )
        </span>
        <span className="px-4 py-1.5 rounded-full border border-[#2A1F18]/40 font-mono text-[10px] tracking-[0.15em] text-[#2A1F18] uppercase font-bold bg-[#E2DDD0]">
          ( INTENTIONAL CREATIVE TWIST )
        </span>
      </div>

      {/* Editorial Action Buttons */}
      <div className="pt-4 border-t border-[#2A1F18]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-[11px] tracking-[0.1em] text-[#2A1F18]/70 text-center sm:text-left">
          Connecting Computer Science, Biotech, Design, Law, and Strategy students.
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartDemo}
            className="px-6 py-3 rounded-full bg-[#2A1F18] text-[#EAE8D0] font-mono text-xs tracking-[0.15em] uppercase font-bold transition hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Run 1-Click Demo</span>
          </button>

          <button
            onClick={onPostProject}
            className="px-6 py-3 rounded-full border border-[#2A1F18] text-[#2A1F18] font-mono text-xs tracking-[0.15em] uppercase font-bold transition hover:bg-[#2A1F18] hover:text-[#EAE8D0] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Post Idea</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
