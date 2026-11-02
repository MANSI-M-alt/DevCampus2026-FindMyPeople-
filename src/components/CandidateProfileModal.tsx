import React from 'react';
import { StudentProfile, MatchResult } from '../types';
import { DAYS_OF_WEEK, TIMES_OF_DAY } from '../seedData';
import { getOverlappingFreeSlots } from '../utils/timeUtils';
import { X, Lock, Unlock, Sparkles, Check, ArrowRight, UserCheck, Calendar } from 'lucide-react';

interface CandidateProfileModalProps {
  candidate: StudentProfile | null;
  match: MatchResult | null;
  authorProfile?: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleInterested: (matchId: string, isAuthor: boolean) => void;
  onSelectSparkSession: (match: MatchResult) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  match,
  authorProfile,
  isOpen,
  onClose,
  onToggleInterested,
  onSelectSparkSession,
}) => {
  if (!isOpen || !candidate || !match) return null;

  const overlaps = authorProfile
    ? getOverlappingFreeSlots(authorProfile.freeSlots, candidate.freeSlots)
    : [];

  const isMutual = match.isMutual;
  const hasAuthorExpressed = match.interestedByAuthor;
  const hasCandidateExpressed = match.interestedByCandidate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 font-sans relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Name, Department, Match Score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dashed border-slate-200 pb-5 font-mono">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E2A38] text-white flex items-center justify-center text-xl font-bold shadow-xs">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase">
                <span className="font-bold text-[#1E2A38]">{candidate.department}</span>
                <span>·</span>
                <span>{candidate.year}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1E2A38] tracking-tight">{candidate.name}</h2>
              <span className="text-xs text-slate-500">{candidate.email}</span>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 text-[#1E2A38] px-4 py-2 rounded-2xl text-center shrink-0">
            <div className="text-xs font-bold">{match.matchScore}% FIT SCORE</div>
            <div className="text-[10px] text-slate-500">AI Match Fit</div>
          </div>
        </div>

        {/* Gemini Match Rationale Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#1E2A38] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI MATCH RATIONALE</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            "{match.reason}"
          </p>
        </div>

        {/* Bio & Primary Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">ABOUT {candidate.name.split(' ')[0]}</span>
            <p className="text-slate-700 leading-relaxed">{candidate.bio}</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">PRIMARY CAMPUS GOAL</span>
            <div className="font-bold text-[#1E2A38] uppercase pt-1 text-sm">{candidate.goal}</div>
            <p className="text-slate-500 text-[11px] pt-0.5">
              Goal alignment: <span className="font-bold text-slate-800">{match.goalAlignment}</span> ({match.goalAlignmentNote})
            </p>
          </div>
        </div>

        {/* Skills & Interests Tags */}
        <div className="space-y-4 font-mono text-xs">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">SKILLS & TECHNOLOGIES</span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-[#1E2A38] text-white font-bold text-xs shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">DOMAIN INTERESTS</span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Completed Projects */}
          {candidate.previousProjects && candidate.previousProjects.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                PREVIOUS COMPLETED PROJECTS & PUBLICATIONS ({candidate.previousProjects.length})
              </span>
              <div className="space-y-2">
                {candidate.previousProjects.map((p) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between font-bold text-xs text-[#1E2A38]">
                      <span>{p.title}</span>
                      {p.year && <span className="text-[10px] text-slate-500 font-normal">{p.year}</span>}
                    </div>
                    <div className="text-[11px] text-slate-600">Role: <span className="font-bold">{p.role}</span></div>
                    <p className="text-xs text-slate-600">{p.description}</p>
                    {p.outcomes && (
                      <div className="text-[10px] text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        Outcome: {p.outcomes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly Availability Schedule Grid */}
        <div className="space-y-3 font-mono text-xs border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1E2A38] uppercase">WEEKLY AVAILABILITY MATRIX</span>
            <span className="text-slate-500 text-[11px]">
              {overlaps.length} overlapping free slot windows
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3 font-bold">Time</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d.key} className="py-2 px-2 text-center font-bold">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TIMES_OF_DAY.map((time) => (
                  <tr key={time.key}>
                    <td className="py-2 px-3 font-bold text-slate-700 text-[11px]">{time.label}</td>
                    {DAYS_OF_WEEK.map((day) => {
                      const slotKey = `${day.key}-${time.key}`;
                      const isFree = candidate.freeSlots.includes(slotKey);
                      const isOverlap = authorProfile?.freeSlots.includes(slotKey) && isFree;

                      return (
                        <td key={slotKey} className="py-2 px-1 text-center">
                          <span
                            className={`inline-block w-6 h-6 rounded text-[10px] font-bold leading-6 ${
                              isOverlap
                                ? 'bg-emerald-800 text-white'
                                : isFree
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {isOverlap ? 'M' : isFree ? 'F' : '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-800 inline-block" />
              <span>Mutual Free Slot (M)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-800 inline-block" />
              <span>Candidate Free (F)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div>
            {isMutual ? (
              <div className="flex items-center gap-2 text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
                <Unlock className="w-4 h-4 text-emerald-700" />
                <span>MUTUAL MATCH! EMAIL: {candidate.email}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Contact unlocked when both express interest</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isMutual && (
              <button
                onClick={() => {
                  onClose();
                  onSelectSparkSession(match);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#1E2A38] text-white font-bold transition hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>LAUNCH KICKOFF</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
