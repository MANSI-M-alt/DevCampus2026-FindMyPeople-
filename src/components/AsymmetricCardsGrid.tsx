import React from 'react';
import { MatchResult, StudentProfile, Project } from '../types';
import { ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface AsymmetricCardsGridProps {
  project: Project;
  matches: MatchResult[];
  profiles: StudentProfile[];
  activeUserId: string;
  onSelectMatch: (match: MatchResult) => void;
  onOpenFilterModal?: () => void;
}

export const AsymmetricCardsGrid: React.FC<AsymmetricCardsGridProps> = ({
  project,
  matches,
  profiles,
  activeUserId,
  onSelectMatch,
  onOpenFilterModal,
}) => {
  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];

  return (
    <div className="space-y-8 py-4">
      {/* Editorial Heading Section matching reference image ("A FEW OF OUR WONDERFUL MATCHES... / Our Matches") */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[#2A1F18]/70 uppercase font-bold">
          A FEW OF OUR WONDERFUL MATCHES...
        </div>
        <h2 className="font-serif text-4xl sm:text-6xl font-normal text-[#2A1F18] tracking-tight">
          Our Matches
        </h2>
      </div>

      {/* Unclustered Editorial Match Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.slice(0, 3).map((match, idx) => {
          const candidate = profiles.find((p) => p.id === match.profileId);
          if (!candidate) return null;

          // Card color rotation matching reference image
          const bgColors = [
            'bg-[#E8D8D8] border-[#2A1F18]/15', // Soft Blush
            'bg-[#2A1F18] text-[#EAE8D0] border-[#2A1F18]', // Espresso Dark
            'bg-[#D8E2D8] border-[#2A1F18]/15', // Soft Sage
          ];

          const cardBg = bgColors[idx % bgColors.length];
          const isDarkCard = idx === 1;

          return (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className={`rounded-3xl p-7 border flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 shadow-sm cursor-pointer group ${cardBg}`}
            >
              {/* Top Row: Index & Score */}
              <div className="flex items-center justify-between border-b border-current/10 pb-4">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold opacity-80">
                  0{idx + 1} // CANDIDATE
                </span>
                <span className={`px-3 py-1 rounded-full font-mono text-[11px] tracking-wider uppercase font-bold ${
                  isDarkCard ? 'bg-[#EAE8D0] text-[#2A1F18]' : 'bg-[#2A1F18] text-[#EAE8D0]'
                }`}>
                  {match.matchScore}% FIT
                </span>
              </div>

              {/* Middle Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className={`w-14 h-14 rounded-2xl object-cover border ${
                      isDarkCard ? 'border-[#EAE8D0]/30 bg-white/10' : 'border-[#2A1F18]/20 bg-white/50'
                    }`}
                  />
                  <div>
                    <h3 className="font-serif text-2xl font-bold tracking-tight">
                      {candidate.name}
                    </h3>
                    <div className="font-mono text-[11px] tracking-wider uppercase font-semibold opacity-80">
                      {candidate.department}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-60">
                    Complementary Skill
                  </div>
                  <p className="font-serif italic text-base leading-snug font-normal">
                    "{match.complementarySkill}"
                  </p>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-current/10 flex items-center justify-between">
                <div className="font-mono text-[10px] tracking-wider uppercase opacity-80 font-bold">
                  {candidate.year} Student
                </div>
                <div className={`p-2 rounded-full transition-transform group-hover:translate-x-1 ${
                  isDarkCard ? 'bg-[#EAE8D0] text-[#2A1F18]' : 'bg-[#2A1F18] text-[#EAE8D0]'
                }`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
