import React, { useState, useMemo } from 'react';
import { Project, StudentProfile, MatchResult } from '../types';
import { getOverlappingFreeSlots } from '../utils/timeUtils';
import { DAYS_OF_WEEK } from '../seedData';
import { Lock, RefreshCw, Eye, Search, SlidersHorizontal, Sparkles, Check, X, Filter, Send, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { CandidateProfileModal } from './CandidateProfileModal';

interface ProjectCollaboratorListProps {
  project: Project;
  profiles: StudentProfile[];
  matches: MatchResult[];
  activeUserId: string;
  isLoadingMatches: boolean;
  matchError: string | null;
  onRefreshMatches: () => void;
  onToggleInterested: (matchId: string, isAuthor: boolean) => void;
  onSelectSparkSession: (match: MatchResult) => void;
}

type FitFocusMode = 'balanced' | 'skills' | 'schedule' | 'goal';

export const ProjectCollaboratorList: React.FC<ProjectCollaboratorListProps> = ({
  project,
  profiles,
  matches,
  activeUserId,
  isLoadingMatches,
  matchError,
  onRefreshMatches,
  onToggleInterested,
  onSelectSparkSession,
}) => {
  const authorProfile = profiles.find((p) => p.id === project.authorId);
  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];

  // Modal State for candidate inspection
  const [selectedCandidate, setSelectedCandidate] = useState<StudentProfile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  // Interactive Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [goalFilter, setGoalFilter] = useState<string>('ALL');
  const [focusMode, setFocusMode] = useState<FitFocusMode>('balanced');
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenProfileModal = (candidate: StudentProfile, match: MatchResult) => {
    setSelectedCandidate(candidate);
    setSelectedMatch(match);
  };

  const handleCloseModal = () => {
    setSelectedCandidate(null);
    setSelectedMatch(null);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Solid card styles (No gradients, no gold)
  const solidCardStyles = [
    {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-slate-400',
      badge: 'bg-slate-100 text-[#1E2A38] border-slate-300',
    },
    {
      bg: 'bg-[#F8FAFC]',
      border: 'border-indigo-200 hover:border-indigo-400',
      badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    },
    {
      bg: 'bg-[#F8FAFC]',
      border: 'border-[#1E2A38]/20 hover:border-[#1E2A38]',
      badge: 'bg-slate-200 text-[#1E2A38] border-slate-300',
    },
  ];

  // Dynamic Fit Score Adjustment based on user focus mode
  const adjustedMatches = useMemo(() => {
    return matches.map((match) => {
      const candidate = profiles.find((p) => p.id === match.profileId);
      if (!candidate) return { ...match, calculatedScore: match.matchScore };

      let baseScore = match.matchScore;
      const overlaps = authorProfile
        ? getOverlappingFreeSlots(authorProfile.freeSlots, candidate.freeSlots)
        : [];

      if (focusMode === 'schedule') {
        const scheduleBoost = Math.min(overlaps.length * 4, 12);
        baseScore = Math.min(100, baseScore + scheduleBoost - 2);
      } else if (focusMode === 'skills') {
        const skillMatchCount = candidate.skills.filter((s) =>
          project.description.toLowerCase().includes(s.toLowerCase()) ||
          project.rolesNeeded.some((r) => r.toLowerCase().includes(s.toLowerCase()))
        ).length;
        baseScore = Math.min(100, baseScore + skillMatchCount * 3 + 4);
      } else if (focusMode === 'goal') {
        if (candidate.goal === project.goal) {
          baseScore = Math.min(100, baseScore + 8);
        }
      }

      return {
        ...match,
        calculatedScore: Math.round(baseScore),
        overlapSlots: overlaps,
      };
    });
  }, [matches, profiles, authorProfile, project, focusMode]);

  // Unique Department List for Filter Pills
  const deptList = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => {
      const p = profiles.find((pr) => pr.id === m.profileId);
      if (p) set.add(p.department.split(' ')[0]);
    });
    return Array.from(set);
  }, [matches, profiles]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return adjustedMatches.filter((m) => {
      const candidate = profiles.find((p) => p.id === m.profileId);
      if (!candidate) return false;

      // Department Filter
      if (deptFilter !== 'ALL' && !candidate.department.toLowerCase().includes(deptFilter.toLowerCase())) {
        return false;
      }

      // Goal Filter
      if (goalFilter !== 'ALL' && !candidate.goal.toLowerCase().includes(goalFilter.toLowerCase())) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = candidate.name.toLowerCase().includes(q);
        const matchesSkill = candidate.skills.some((s) => s.toLowerCase().includes(q));
        const matchesReason = m.reason.toLowerCase().includes(q);
        const matchesDept = candidate.department.toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesReason && !matchesDept) {
          return false;
        }
      }

      return true;
    });
  }, [adjustedMatches, profiles, deptFilter, goalFilter, searchQuery]);

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E2A38] text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 font-mono text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Send className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Re-run Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1E2A38] tracking-tight font-mono uppercase">
              RECOMMENDED COLLABORATORS ({filteredMatches.length})
            </h2>
            {highlightedSkill && (
              <span className="bg-slate-200 text-[#1E2A38] border border-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <span>Highlight: {highlightedSkill}</span>
                <button onClick={() => setHighlightedSkill(null)} className="cursor-pointer hover:text-black">x</button>
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 block pt-0.5">
            Evaluate matches based on complementary skills, availability, and project goals.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search Input */}
          <div className="relative font-mono text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill or name..."
              className="pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[#1E2A38] text-xs font-bold focus:outline-none focus:bg-white focus:border-slate-400 transition w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onRefreshMatches}
            disabled={isLoadingMatches}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[#1E2A38] font-mono text-xs font-bold transition hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingMatches ? 'animate-spin' : ''}`} />
            <span>RE-RUN MATCH</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar: Dept Filter & Fit Weight Selector */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5 font-mono text-xs">
        
        {/* Row 1: Department Filter Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" /> DEPT:
          </span>
          <button
            onClick={() => setDeptFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
              deptFilter === 'ALL'
                ? 'bg-[#1E2A38] text-white border-[#1E2A38] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ALL ({matches.length})
          </button>
          {deptList.map((dept) => {
            const count = matches.filter((m) => {
              const p = profiles.find((pr) => pr.id === m.profileId);
              return p?.department.toLowerCase().includes(dept.toLowerCase());
            }).length;

            return (
              <button
                key={dept}
                onClick={() => setDeptFilter(deptFilter === dept ? 'ALL' : dept)}
                className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
                  deptFilter === dept
                    ? 'bg-[#1E2A38] text-white border-[#1E2A38] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {dept.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 2: Fit Criteria Priority Tuning Controls */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
          <span className="text-slate-500 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-500" /> RANK BY:
          </span>

          <button
            onClick={() => setFocusMode('balanced')}
            className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
              focusMode === 'balanced'
                ? 'bg-[#1E2A38] text-white border-[#1E2A38]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Balanced
          </button>

          <button
            onClick={() => setFocusMode('skills')}
            className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
              focusMode === 'skills'
                ? 'bg-indigo-900 text-white border-indigo-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Skill Fit
          </button>

          <button
            onClick={() => setFocusMode('schedule')}
            className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
              focusMode === 'schedule'
                ? 'bg-emerald-900 text-white border-emerald-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Free Schedule
          </button>

          <button
            onClick={() => setFocusMode('goal')}
            className={`px-3 py-1 rounded-lg transition font-bold cursor-pointer border ${
              focusMode === 'goal'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Goal Alignment
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingMatches && (
        <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono">
          <div className="w-8 h-8 border-3 border-slate-300 border-t-[#1E2A38] rounded-full animate-spin mx-auto" />
          <div className="text-xs font-bold text-[#1E2A38]">EVALUATING COMPLEMENTARY SKILLS VIA AI...</div>
        </div>
      )}

      {/* Error State */}
      {matchError && !isLoadingMatches && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-mono text-rose-800">
          Error: {matchError}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingMatches && filteredMatches.length === 0 && (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200 font-mono space-y-2">
          <div className="text-sm font-bold text-[#1E2A38]">NO COLLABORATORS MATCH CURRENT FILTERS</div>
          <p className="text-xs text-slate-500">Try resetting department filters or search keywords.</p>
          <button
            onClick={() => {
              setDeptFilter('ALL');
              setGoalFilter('ALL');
              setSearchQuery('');
              setHighlightedSkill(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#1E2A38] text-white text-xs font-bold cursor-pointer"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* Grid Layout: Clean, crisp, solid borders, pixel-aligned buttons */}
      {!isLoadingMatches && filteredMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match, idx) => {
            const candidate = profiles.find((p) => p.id === match.profileId);
            if (!candidate) return null;

            const hasAuthorExpressed = match.interestedByAuthor;
            const hasCandidateExpressed = match.interestedByCandidate;
            const isMutual = match.isMutual;

            const style = solidCardStyles[idx % solidCardStyles.length];

            const matchesHighlightedSkill =
              highlightedSkill &&
              candidate.skills.some((s) => s.toLowerCase().includes(highlightedSkill.toLowerCase()));

            // Determine active perspective roles
            const isProjectOwnerActive = activeUserId === project.authorId;
            const isCandidateActive = activeUserId === candidate.id;

            return (
              <div
                key={match.id}
                className={`p-5 rounded-2xl border transition-all duration-150 space-y-4 flex flex-col justify-between ${
                  style.bg
                } ${style.border} ${
                  matchesHighlightedSkill ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header Row: Department, Fit Score, View Profile */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-[#1E2A38] uppercase truncate">{candidate.department.split(' ')[0]}</span>
                      <span className="text-slate-400">·</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${style.badge}`}>
                        {match.calculatedScore}% MATCH FIT
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenProfileModal(candidate, match)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#1E2A38] font-mono text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      <span>View Profile</span>
                    </button>
                  </div>

                  {/* Name & Match Rationale */}
                  <div
                    onClick={() => handleOpenProfileModal(candidate, match)}
                    className="cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#1E2A38] group-hover:text-indigo-900 transition tracking-tight">
                        {candidate.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {candidate.year}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      "{match.reason}"
                    </p>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    <span className="text-slate-400 font-bold uppercase self-center mr-1 text-[10px]">SKILLS:</span>
                    {candidate.skills.slice(0, 4).map((s) => {
                      const isHighlighted = highlightedSkill === s;
                      return (
                        <button
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHighlightedSkill(isHighlighted ? null : s);
                          }}
                          className={`px-2.5 py-0.5 rounded border transition cursor-pointer font-bold ${
                            isHighlighted
                              ? 'bg-[#1E2A38] text-white border-[#1E2A38]'
                              : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  {/* Weekly Availability Heatmap Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">AVAILABILITY:</span>
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day) => {
                        const countForDay = candidate.freeSlots.filter((slot) => slot.startsWith(day.key)).length;
                        const authorHasDay = authorProfile?.freeSlots.some((slot) => slot.startsWith(day.key));
                        const isOverlap = countForDay > 0 && authorHasDay;

                        return (
                          <span
                            key={day.key}
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              isOverlap
                                ? 'bg-emerald-800 text-white'
                                : countForDay > 0
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                            title={`${day.label}: ${countForDay} slots ${isOverlap ? '(Overlaps)' : ''}`}
                          >
                            {day.key[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION AREA: ROLE-RESTRICTED PERSPECTIVE ACTION */}
                <div className="pt-3 border-t border-slate-200 space-y-2 font-mono text-xs">
                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <span>Owner Proposal:</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] ${hasAuthorExpressed ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        {hasAuthorExpressed ? 'Sent' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <span>Candidate Response:</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] ${hasCandidateExpressed ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        {hasCandidateExpressed ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Single Action Button based strictly on Active User Perspective */}
                  {isMutual ? (
                    <button
                      onClick={() => onSelectSparkSession(match)}
                      className="w-full py-2.5 rounded-xl bg-[#1E2A38] hover:bg-slate-800 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>START KICKOFF SESSION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isProjectOwnerActive ? (
                    /* Project Owner Action */
                    <button
                      onClick={() => {
                        onToggleInterested(match.id, true);
                        triggerToast(
                          !hasAuthorExpressed
                            ? `Proposal sent to ${candidate.name.split(' ')[0]}!`
                            : `Withdrew project proposal.`
                        );
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        hasAuthorExpressed
                          ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                          : 'bg-[#1E2A38] hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{hasAuthorExpressed ? 'Withdraw Proposal (Sent)' : 'Connect & Propose Collaboration'}</span>
                    </button>
                  ) : isCandidateActive ? (
                    /* Candidate Action */
                    <button
                      onClick={() => {
                        onToggleInterested(match.id, false);
                        triggerToast(
                          !hasCandidateExpressed
                            ? `Interest recorded for ${project.title}!`
                            : `Interest withdrawn.`
                        );
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        hasCandidateExpressed
                          ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                          : 'bg-[#1E2A38] hover:bg-slate-800 text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{hasCandidateExpressed ? 'Interest Sent' : 'Express Interest'}</span>
                    </button>
                  ) : (
                    <p className="text-center text-xs text-slate-500">
                      Sign in as the project owner or suggested collaborator to respond.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Inspector Modal */}
      <CandidateProfileModal
        candidate={selectedCandidate}
        match={selectedMatch}
        authorProfile={authorProfile}
        isOpen={!!selectedCandidate}
        onClose={handleCloseModal}
        onToggleInterested={onToggleInterested}
        onSelectSparkSession={onSelectSparkSession}
      />
    </div>
  );
};
