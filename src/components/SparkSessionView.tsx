import React, { useEffect } from 'react';
import { Project, StudentProfile, MatchResult, SparkSessionData } from '../types';
import { getOverlappingFreeSlots } from '../utils/timeUtils';
import {
  Calendar,
  Clock,
  HelpCircle,
  Users,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface SparkSessionViewProps {
  project: Project;
  match: MatchResult;
  profiles: StudentProfile[];
  sparkData: SparkSessionData | null;
  isLoadingSpark: boolean;
  onGenerateSpark: (match: MatchResult) => void;
  onUpdateDecision: (authorDecision?: 'build' | 'pass', candidateDecision?: 'build' | 'pass') => void;
  onExitOrResetMatch: (matchId: string, removeMatch?: boolean) => void;
}

export const SparkSessionView: React.FC<SparkSessionViewProps> = ({
  project,
  match,
  profiles,
  sparkData,
  isLoadingSpark,
  onGenerateSpark,
  onUpdateDecision,
  onExitOrResetMatch,
}) => {
  const authorProfile = profiles.find((p) => p.id === project.authorId);
  const candidateProfile = profiles.find((p) => p.id === match.profileId);

  useEffect(() => {
    if (!sparkData && !isLoadingSpark) {
      onGenerateSpark(match);
    }
  }, [match.id]);

  if (!authorProfile || !candidateProfile) {
    return <div className="p-8 text-center text-purple-400 font-mono text-xs">Profile data missing.</div>;
  }

  const overlaps = getOverlappingFreeSlots(authorProfile.freeSlots, candidateProfile.freeSlots);
  const top2MeetingTimes = overlaps.slice(0, 2);

  const authorVote = sparkData?.authorDecision;
  const candidateVote = sparkData?.candidateDecision;

  const isBothDecided = authorVote !== undefined && candidateVote !== undefined;
  const isBothBuild = authorVote === 'build' && candidateVote === 'build';
  const hasAnyPass = authorVote === 'pass' || candidateVote === 'pass';

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top Bar with Back/Exit button */}
      <div className="flex items-center justify-between font-mono text-xs">
        <button
          onClick={() => onExitOrResetMatch(match.id, false)}
          className="px-4 py-2 rounded-2xl bg-[#FDF2F7] hover:bg-purple-100 text-[#4A154B] font-bold flex items-center gap-1.5 cursor-pointer transition border border-purple-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Session to Projects</span>
        </button>

        <span className="text-purple-400 font-bold uppercase text-[11px]">
          SESSION ID: {match.id.toUpperCase()}
        </span>
      </div>

      {/* Header Banner - Clean Deep Plum */}
      <div className="bg-[#4A154B] text-white rounded-3xl p-6 space-y-2 border border-[#3F0E40]">
        <div className="font-mono text-[10px] uppercase tracking-wider text-purple-200 font-bold">
          MUTUAL MATCH KICKOFF
        </div>
        <h2 className="text-2xl font-bold tracking-tight">SPARK SESSION SETUP</h2>
        <p className="font-mono text-xs text-purple-200 leading-relaxed">
          Both {authorProfile.name} and {candidateProfile.name} confirmed mutual interest in "{project.title}".
        </p>
      </div>

      {isLoadingSpark && (
        <div className="py-12 text-center space-y-3 font-mono text-xs text-purple-400">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#4A154B] rounded-full animate-spin mx-auto" />
          <div>GENERATING KICKOFF KIT...</div>
        </div>
      )}

      {!isLoadingSpark && sparkData && (
        <div className="space-y-6">
          {/* Unlocked Contact & Icebreaker */}
          <div className="bg-white border border-purple-100 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-4 font-mono">
              <div>
                <h3 className="text-base font-bold text-[#4A154B]">{authorProfile.name} & {candidateProfile.name}</h3>
                <div className="text-xs text-purple-400">{authorProfile.department} + {candidateProfile.department}</div>
              </div>

              <div className="bg-[#FDF2F7] border border-purple-200 p-3 rounded-2xl text-xs space-y-0.5">
                <div className="font-bold text-[#4A154B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4A154B]" /> CONTACT UNLOCKED
                </div>
                <div className="text-[#4A154B] font-bold">{authorProfile.name}: {authorProfile.email}</div>
                <div className="text-[#4A154B] font-bold">{candidateProfile.name}: {candidateProfile.email}</div>
              </div>
            </div>

            {/* Icebreaker */}
            <div className="bg-[#FAF5F8] border border-purple-100 p-4 rounded-2xl font-mono text-xs space-y-1">
              <div className="font-bold text-[#4A154B] text-[10px] uppercase">1-LINE KICKOFF ICEBREAKER</div>
              <div className="text-purple-900 leading-relaxed">"{sparkData.icebreaker}"</div>
            </div>
          </div>

          {/* Meeting Overlap */}
          <div className="bg-white border border-purple-100 rounded-3xl p-6 space-y-3 font-mono text-xs">
            <div className="text-sm font-bold text-[#4A154B] border-b border-purple-100 pb-2 flex items-center gap-1.5 uppercase">
              <Calendar className="w-4 h-4 text-[#4A154B]" />
              <span>TOP SUGGESTED MEETING TIMES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {top2MeetingTimes.map((slot, idx) => (
                <div key={slot.slotKey} className="bg-[#FAF5F8] p-3.5 rounded-2xl border border-purple-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A154B] text-white font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-[#4A154B]">{slot.dayLabel} — {slot.timeLabel}</div>
                    <div className="text-[10px] text-purple-400">{slot.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions & Agenda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-3">
              <div className="font-bold text-[#4A154B] border-b border-purple-100 pb-2 flex items-center gap-1.5 uppercase">
                <HelpCircle className="w-4 h-4 text-[#4A154B]" />
                <span>3 FIT CHECK QUESTIONS</span>
              </div>
              <div className="space-y-2">
                {sparkData.fitQuestions.map((q, idx) => (
                  <div key={idx} className="bg-[#FAF5F8] p-3 rounded-2xl border border-purple-100">
                    <span className="font-bold text-[#4A154B] mr-1">Q{idx + 1}:</span>
                    <span className="text-purple-900">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-3">
              <div className="font-bold text-[#4A154B] border-b border-purple-100 pb-2 flex items-center gap-1.5 uppercase">
                <Clock className="w-4 h-4 text-[#4A154B]" />
                <span>20-MIN AGENDA</span>
              </div>
              <div className="space-y-2">
                {sparkData.agenda.map((item, idx) => (
                  <div key={idx} className="bg-[#FAF5F8] p-3 rounded-2xl border border-purple-100 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#4A154B] text-white text-[10px] font-bold">
                      {item.time}
                    </span>
                    <span className="text-purple-900">{item.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decide Together Section */}
          <div className="bg-white border border-purple-100 rounded-3xl p-6 space-y-4 font-mono text-xs">
            <div className="font-bold text-[#4A154B] border-b border-purple-100 pb-2 flex items-center justify-between uppercase">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#4A154B]" />
                <span>DECIDE TOGETHER: FINAL EVALUATION</span>
              </div>
              <span className="text-[10px] text-purple-400">Owner & Candidate must both agree to build</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF5F8] p-4 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A154B]">{authorProfile.name} (Owner)</span>
                  {authorVote && (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${authorVote === 'build' ? 'bg-[#4A154B] text-white' : 'bg-rose-100 text-rose-800'}`}>
                      {authorVote === 'build' ? 'Agreed' : 'Passed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateDecision('build', candidateVote)}
                    className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                      authorVote === 'build' ? 'bg-[#4A154B] text-white' : 'bg-white border border-purple-200 text-[#4A154B] hover:bg-purple-100'
                    }`}
                  >
                    Let's Build
                  </button>
                  <button
                    onClick={() => onUpdateDecision('pass', candidateVote)}
                    className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                      authorVote === 'pass' ? 'bg-rose-800 text-white' : 'bg-white border border-purple-200 text-[#4A154B] hover:bg-purple-100'
                    }`}
                  >
                    Not a Fit
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF5F8] p-4 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A154B]">{candidateProfile.name} (Candidate)</span>
                  {candidateVote && (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${candidateVote === 'build' ? 'bg-[#4A154B] text-white' : 'bg-rose-100 text-rose-800'}`}>
                      {candidateVote === 'build' ? 'Agreed' : 'Passed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateDecision(authorVote, 'build')}
                    className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                      candidateVote === 'build' ? 'bg-[#4A154B] text-white' : 'bg-white border border-purple-200 text-[#4A154B] hover:bg-purple-100'
                    }`}
                  >
                    Let's Build
                  </button>
                  <button
                    onClick={() => onUpdateDecision(authorVote, 'pass')}
                    className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                      candidateVote === 'pass' ? 'bg-rose-800 text-white' : 'bg-white border border-purple-200 text-[#4A154B] hover:bg-purple-100'
                    }`}
                  >
                    Not a Fit
                  </button>
                </div>
              </div>
            </div>

            {/* Outcome Case A: BOTH AGREE TO BUILD */}
            {isBothDecided && isBothBuild && (
              <div className="bg-[#4A154B] text-white p-6 rounded-3xl text-center space-y-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-10 h-10 mx-auto text-pink-300" />
                <h3 className="text-lg font-bold">IT IS OFFICIAL! YOU ARE BUILDING TOGETHER</h3>
                <p className="text-xs text-purple-200 max-w-md mx-auto leading-relaxed">
                  Both {authorProfile.name.split(' ')[0]} and {candidateProfile.name.split(' ')[0]} confirmed the partnership. Contact details and kickoff schedule are locked in.
                </p>
                <button
                  onClick={() => onExitOrResetMatch(match.id, false)}
                  className="px-6 py-2.5 rounded-2xl bg-white text-[#4A154B] font-bold transition hover:bg-purple-50 cursor-pointer text-xs inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#4A154B]" />
                  <span>COMPLETE KICKOFF</span>
                </button>
              </div>
            )}

            {/* Outcome Case B: EITHER DISAGREES / PASSES */}
            {hasAnyPass && (
              <div className="bg-rose-950 text-white p-6 rounded-3xl text-center space-y-3 animate-in fade-in duration-300">
                <XCircle className="w-10 h-10 mx-auto text-rose-300" />
                <h3 className="text-lg font-bold">PARTNERSHIP DECLINED & SESSION CLOSED</h3>
                <p className="text-xs text-rose-200 max-w-md mx-auto leading-relaxed">
                  One or both parties decided this is not the right fit at this time. You can exit this session and explore other recommended collaborators.
                </p>
                <button
                  onClick={() => onExitOrResetMatch(match.id, true)}
                  className="px-6 py-2.5 rounded-2xl bg-white text-rose-950 font-bold transition hover:bg-rose-50 cursor-pointer text-xs inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-800" />
                  <span>EXIT & REMOVE MATCH</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
