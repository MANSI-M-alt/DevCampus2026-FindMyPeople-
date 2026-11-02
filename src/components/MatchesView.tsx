import React from 'react';
import { Project, StudentProfile, MatchResult } from '../types';
import { getOverlappingFreeSlots } from '../utils/timeUtils';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  Lock,
  Unlock,
  ArrowRight,
  RefreshCw,
  Clock,
  UserCheck,
} from 'lucide-react';

interface MatchesViewProps {
  project: Project;
  profiles: StudentProfile[];
  matches: MatchResult[];
  activeUserId: string;
  isLoadingMatches: boolean;
  matchError: string | null;
  onRefreshMatches: () => void;
  onToggleInterested: (matchId: string, isAuthor: boolean) => void;
  onSelectSparkSession: (match: MatchResult) => void;
  onSwitchActiveUser: (userId: string) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  project,
  profiles,
  matches,
  activeUserId,
  isLoadingMatches,
  matchError,
  onRefreshMatches,
  onToggleInterested,
  onSelectSparkSession,
  onSwitchActiveUser,
}) => {
  const authorProfile = profiles.find((p) => p.id === project.authorId);

  return (
    <div className="space-y-8 pb-24">
      {/* Target Project Header */}
      <div className="bg-[#EAE8D0] text-[#2A1F18] border border-[#2A1F18]/15 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A1F18]/10 pb-6">
          <div className="space-y-1">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold text-[#2A1F18]/70">
              FEATURED PROJECT
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#2A1F18]">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onRefreshMatches}
            disabled={isLoadingMatches}
            className="px-5 py-2.5 rounded-full bg-[#2A1F18] text-[#EAE8D0] font-mono text-xs tracking-[0.15em] uppercase font-bold transition flex items-center gap-2 hover:opacity-90 shrink-0 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMatches ? 'animate-spin' : ''}`} />
            <span>Re-run Gemini</span>
          </button>
        </div>

        <p className="font-serif italic text-base sm:text-lg text-[#2A1F18]/90 leading-relaxed font-normal">
          "{project.description}"
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A1F18]/10">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-[#2A1F18]/60 mr-2">
            ROLES NEEDED:
          </span>
          {project.rolesNeeded.map((role) => (
            <span key={role} className="px-3 py-1 rounded-full bg-[#2A1F18]/10 font-mono text-[11px] tracking-wider text-[#2A1F18] font-bold">
              {role}
            </span>
          ))}
        </div>

        {/* Perspective Switcher */}
        <div className="bg-[#E2DDD0] border border-[#2A1F18]/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-[#2A1F18]/70 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Double Opt-In Perspective Switcher</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {authorProfile && (
              <button
                onClick={() => onSwitchActiveUser(authorProfile.id)}
                className={`px-3 py-1.5 rounded-full font-mono text-[11px] tracking-wider uppercase font-bold transition cursor-pointer ${
                  activeUserId === authorProfile.id
                    ? 'bg-[#2A1F18] text-[#EAE8D0]'
                    : 'bg-[#2A1F18]/5 text-[#2A1F18] hover:bg-[#2A1F18]/10'
                }`}
              >
                Owner ({authorProfile.name.split(' ')[0]})
              </button>
            )}

            {matches.map((m) => {
              const cand = profiles.find((p) => p.id === m.profileId);
              if (!cand) return null;
              const isSelected = activeUserId === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => onSwitchActiveUser(cand.id)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[11px] tracking-wider uppercase font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A1F18] text-[#EAE8D0]'
                      : 'bg-[#2A1F18]/5 text-[#2A1F18] hover:bg-[#2A1F18]/10'
                  }`}
                >
                  {cand.name.split(' ')[0]} ({cand.department.split(' ')[0]})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoadingMatches && (
        <div className="bg-[#EAE8D0] text-[#2A1F18] rounded-3xl p-12 text-center space-y-3 border border-[#2A1F18]/15">
          <div className="w-8 h-8 border-2 border-[#2A1F18]/20 border-t-[#2A1F18] rounded-full animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold">Evaluating Complementary Skills with Gemini...</h3>
        </div>
      )}

      {/* Error */}
      {matchError && !isLoadingMatches && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <h3 className="font-mono text-xs font-bold text-rose-900">{matchError}</h3>
        </div>
      )}

      {/* Detailed Matches Cards */}
      {!isLoadingMatches && matches.length > 0 && (
        <div className="space-y-6">
          {matches.map((match, index) => {
            const candidate = profiles.find((p) => p.id === match.profileId);
            if (!candidate) return null;

            const overlaps = authorProfile
              ? getOverlappingFreeSlots(authorProfile.freeSlots, candidate.freeSlots)
              : [];

            const hasAuthorExpressed = match.interestedByAuthor;
            const hasCandidateExpressed = match.interestedByCandidate;
            const isMutual = match.isMutual;

            return (
              <div
                key={match.id}
                className={`bg-[#EAE8D0] text-[#2A1F18] rounded-3xl p-8 border space-y-6 transition-all duration-300 shadow-sm ${
                  isMutual ? 'border-amber-700/50 bg-[#E2DDD0]' : 'border-[#2A1F18]/15'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-[#2A1F18]/10 pb-4">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold text-[#2A1F18]/70">
                    MATCH // 0{index + 1}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#2A1F18] text-[#EAE8D0] font-mono text-[11px] tracking-wider uppercase font-bold">
                    {match.matchScore}% COMPLEMENTARY FIT
                  </span>
                </div>

                {/* Candidate Info Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-[#2A1F18]/10 pb-4 lg:pb-0 lg:pr-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-2xl border border-[#2A1F18]/20 bg-white object-cover"
                      />
                      <div>
                        <h3 className="font-serif text-2xl font-bold">{candidate.name}</h3>
                        <div className="font-mono text-[11px] tracking-wider uppercase font-bold text-[#2A1F18]/70">
                          {candidate.department}
                        </div>
                        <div className="font-mono text-[10px] text-[#2A1F18]/60 mt-0.5">{candidate.year} Student</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-60">Top Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[#2A1F18]/5 font-mono text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#E2DDD0] p-3 rounded-2xl border border-[#2A1F18]/10 font-mono text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" /> Overlap: {overlaps.length} slots
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {overlaps.slice(0, 3).map((o) => (
                          <span key={o.slotKey} className="px-1.5 py-0.5 rounded bg-[#2A1F18] text-[#EAE8D0] text-[9px] font-bold">
                            {o.dayLabel} {o.timeLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rationale & Details */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-[#E2DDD0] p-5 rounded-2xl border border-[#2A1F18]/10 space-y-1">
                      <div className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#2A1F18]/70 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-700" />
                        <span>WHY THIS PAIRING WORKS</span>
                      </div>
                      <p className="font-serif italic text-base leading-relaxed text-[#2A1F18]">
                        "{match.reason}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#E2DDD0]/60 p-3.5 rounded-2xl border border-[#2A1F18]/10 text-xs space-y-1">
                        <div className="font-mono text-[10px] tracking-wider uppercase opacity-60">💡 Complementary Skill</div>
                        <div className="font-serif italic text-sm font-bold">{match.complementarySkill}</div>
                      </div>

                      <div className="bg-[#E2DDD0]/60 p-3.5 rounded-2xl border border-[#2A1F18]/10 text-xs space-y-1">
                        <div className="font-mono text-[10px] tracking-wider uppercase opacity-60">Goal Alignment ({match.goalAlignment})</div>
                        <div className="font-serif text-xs font-semibold">{match.goalAlignmentNote}</div>
                      </div>
                    </div>

                    {/* Opt-In Actions */}
                    <div className="pt-2 border-t border-[#2A1F18]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        {isMutual ? (
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-900 bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-300">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Contact: {candidate.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[#2A1F18]/60">
                            <Lock className="w-3 h-3" />
                            <span>Email locked until mutual opt-in</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isMutual ? (
                          <button
                            onClick={() => onSelectSparkSession(match)}
                            className="px-6 py-2.5 rounded-full bg-[#2A1F18] text-[#EAE8D0] font-mono text-xs tracking-[0.15em] uppercase font-bold shadow-md transition hover:opacity-90 flex items-center gap-2 cursor-pointer"
                          >
                            <span>Launch Spark Session ⚡</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleInterested(match.id, true)}
                              className={`px-3.5 py-2 rounded-full font-mono text-[11px] tracking-wider uppercase font-bold transition cursor-pointer ${
                                hasAuthorExpressed
                                  ? 'bg-[#2A1F18] text-[#EAE8D0]'
                                  : 'bg-[#2A1F18]/10 text-[#2A1F18] hover:bg-[#2A1F18]/20'
                              }`}
                            >
                              {hasAuthorExpressed ? 'Owner: Interested ✓' : 'Owner: Interested?'}
                            </button>

                            <button
                              onClick={() => onToggleInterested(match.id, false)}
                              className={`px-3.5 py-2 rounded-full font-mono text-[11px] tracking-wider uppercase font-bold transition cursor-pointer ${
                                hasCandidateExpressed
                                  ? 'bg-[#2A1F18] text-[#EAE8D0]'
                                  : 'bg-[#2A1F18]/10 text-[#2A1F18] hover:bg-[#2A1F18]/20'
                              }`}
                            >
                              {hasCandidateExpressed ? 'Candidate: Interested ✓' : 'Candidate: Interested?'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
