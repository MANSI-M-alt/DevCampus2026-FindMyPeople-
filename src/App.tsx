import React, { useState } from 'react';
import { StudentProfile, Project, MatchResult, SparkSessionData } from './types';
import { INITIAL_PROFILES, SAMPLE_PROJECT, USER_PROJECTS_MAP, getMatchesForUser } from './seedData';
import { HeaderNav, NavTab } from './components/HeaderNav';
import { ProjectCollaboratorList } from './components/ProjectCollaboratorList';
import { ProfileView } from './components/ProfileView';
import { PostProjectView } from './components/PostProjectView';
import { SparkSessionView } from './components/SparkSessionView';
import { PhdScholarsView } from './components/PhdScholarsView';
import { Plus, Users, Sparkles, Layers, ArrowRight } from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<StudentProfile[]>(INITIAL_PROFILES);
  const [activeUserId, setActiveUserId] = useState<string>('prof-sandra-cs');
  const [userProjects, setUserProjects] = useState<Record<string, Project>>(USER_PROJECTS_MAP);
  const [currentProjectId, setCurrentProjectId] = useState<string>(SAMPLE_PROJECT.id);
  const [matches, setMatches] = useState<MatchResult[]>(getMatchesForUser('prof-sandra-cs'));
  const [activeTab, setActiveTab] = useState<NavTab>('projects');

  // AI Loading & Error States
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Spark Session States
  const [selectedMatchForSpark, setSelectedMatchForSpark] = useState<MatchResult | null>(matches[0] || null);
  const [sparkSessions, setSparkSessions] = useState<Record<string, SparkSessionData>>({});
  const [isLoadingSpark, setIsLoadingSpark] = useState<boolean>(false);

  const activeProfile = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const currentProject = userProjects[activeUserId] || Object.values(userProjects).find(p => p.id === currentProjectId) || SAMPLE_PROJECT;
  const mutualMatches = matches.filter((m) => m.isMutual);

  // Switch user perspective (Sandra, Marcus, Aria, Devon, Elena, Kai, Zoe, Leo...)
  const handleSelectActiveUser = (newUserId: string) => {
    setActiveUserId(newUserId);
    const newProj = userProjects[newUserId] || SAMPLE_PROJECT;
    setCurrentProjectId(newProj.id);
    const newMatches = getMatchesForUser(newUserId);
    setMatches(newMatches);
    const firstMutual = newMatches.find((m) => m.isMutual) || newMatches[0] || null;
    setSelectedMatchForSpark(firstMutual);
  };

  // Update profile handler
  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
  };

  // Add new project handler
  const handleProjectPosted = (newProject: Project) => {
    setUserProjects((prev) => ({
      ...prev,
      [activeUserId]: newProject,
    }));
    setCurrentProjectId(newProject.id);
    fetchMatchesForProject(newProject, profiles);
  };

  // Call Gemini API to calculate matches
  const fetchMatchesForProject = async (proj: Project, pool: StudentProfile[]) => {
    setIsLoadingMatches(true);
    setMatchError(null);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: proj, profiles: pool }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate matches.');
      }

      if (data.matches && Array.isArray(data.matches)) {
        const formatted: MatchResult[] = data.matches.map((m: any) => ({
          id: `match-${proj.id}-${m.profileId}`,
          projectId: proj.id,
          profileId: m.profileId,
          matchScore: m.matchScore || 85,
          reason: m.reason || 'Strong complementary skills for this project.',
          complementarySkill: m.complementarySkill || 'Subject Matter Expertise',
          goalAlignment: m.goalAlignment || 'strong',
          goalAlignmentNote: m.goalAlignmentNote || 'Aligned goals for execution.',
          risk: m.risk || 'Time schedule management required.',
          interestedByAuthor: false,
          interestedByCandidate: false,
          isMutual: false,
        }));

        setMatches(formatted);
      }
    } catch (err: any) {
      console.error('Match error:', err);
      setMatchError(err.message || 'An error occurred while running smart matching.');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Toggle Interest (Double Opt-In Logic)
  const handleToggleInterested = (matchId: string, isAuthorAction: boolean) => {
    setMatches((prevMatches) =>
      prevMatches.map((m) => {
        if (m.id !== matchId) return m;

        const newAuthor = isAuthorAction ? !m.interestedByAuthor : m.interestedByAuthor;
        const newCandidate = !isAuthorAction ? !m.interestedByCandidate : m.interestedByCandidate;
        const isMutual = newAuthor && newCandidate;

        const updated = {
          ...m,
          interestedByAuthor: newAuthor,
          interestedByCandidate: newCandidate,
          isMutual,
        };

        if (isMutual) {
          setSelectedMatchForSpark(updated);
        }

        return updated;
      })
    );
  };

  // Instant Spark Session generator with background API enhancement
  const handleGenerateSpark = async (match: MatchResult) => {
    const authorP = profiles.find((p) => p.id === currentProject.authorId);
    const candidateP = profiles.find((p) => p.id === match.profileId);

    if (!authorP || !candidateP) return;

    // Instant zero-lag default kit so view opens immediately
    const instantKit = {
      matchId: match.id,
      icebreaker: `What inspired both of you (${authorP.name.split(' ')[0]} & ${candidateP.name.split(' ')[0]}) to collaborate on "${currentProject.title}"?`,
      fitQuestions: [
        `How do ${authorP.department.split(' ')[0]} and ${candidateP.department.split(' ')[0]} workflows best complement each other?`,
        'What is your realistic weekly hour commitment and focus windows?',
        'What key milestone would make this collaboration an absolute success?',
      ],
      agenda: [
        { time: '0-3 min', topic: 'Icebreaker & Project Vision Alignment' },
        { time: '3-10 min', topic: 'Skill Complementarity & Role Boundaries' },
        { time: '10-17 min', topic: 'Availability, Work Rhythms & Tooling' },
        { time: '17-20 min', topic: 'Decision & Next Steps Setup' },
      ],
      suggestedMeetingTimes: [],
    };

    setSparkSessions((prev) => ({
      ...prev,
      [match.id]: prev[match.id] || instantKit,
    }));

    try {
      const response = await fetch('/api/spark-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: currentProject,
          authorProfile: authorP,
          candidateProfile: candidateP,
        }),
      });

      if (!response.ok) return;
      const data = await response.json();
      if (data.sparkKit) {
        setSparkSessions((prev) => ({
          ...prev,
          [match.id]: {
            ...prev[match.id],
            icebreaker: data.sparkKit.icebreaker || instantKit.icebreaker,
            fitQuestions: data.sparkKit.fitQuestions || instantKit.fitQuestions,
            agenda: data.sparkKit.agenda || instantKit.agenda,
          },
        }));
      }
    } catch (err) {
      console.log('Using default instant spark kit');
    }
  };

  // Exit or Reset Match (When candidate/owner disagree or user completes session)
  const handleExitOrResetMatch = (matchId: string, removeMatch: boolean = false) => {
    if (removeMatch) {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, interestedByAuthor: false, interestedByCandidate: false, isMutual: false }
            : m
        )
      );
    }
    setSelectedMatchForSpark(null);
    setActiveTab('projects');
  };

  // Update Spark Decision ("Let's build" vs "Not a fit")
  const handleUpdateSparkDecision = (
    authorDecision?: 'build' | 'pass',
    candidateDecision?: 'build' | 'pass'
  ) => {
    if (!selectedMatchForSpark) return;
    const matchId = selectedMatchForSpark.id;

    setSparkSessions((prev) => {
      const existing = prev[matchId] || {
        matchId,
        icebreaker: 'What inspired both of you to tackle this challenge?',
        fitQuestions: [
          'How do you manage deadline pressures and async vs synchronous communication?',
          'What is your realistic weekly hour commitment?',
          'What outcome defines success for your personal goals?',
        ],
        agenda: [
          { time: '0-3 min', topic: 'Icebreaker & Project Vision' },
          { time: '3-10 min', topic: 'Skill Complementarity & Boundaries' },
          { time: '10-17 min', topic: 'Availability & Rhythms' },
          { time: '17-20 min', topic: 'Decision & Next Steps Setup' },
        ],
        suggestedMeetingTimes: [],
      };

      return {
        ...prev,
        [matchId]: {
          ...existing,
          authorDecision: authorDecision !== undefined ? authorDecision : existing.authorDecision,
          candidateDecision: candidateDecision !== undefined ? candidateDecision : existing.candidateDecision,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF5F8] text-[#4A154B] font-sans">
      {/* Sticky Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profiles={profiles}
        activeUserId={activeUserId}
        onSelectActiveUser={handleSelectActiveUser}
        mutualCount={mutualMatches.length}
      />

      {/* Main Web Workspace Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Projects & Matches Low-Scroll Layout */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            
            {/* Left Sidebar (4 cols): Active Project Card & Perspective Switcher */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Featured Active Project Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#1E2A38] uppercase tracking-wider">CURRENT PROJECT</span>
                  <span className="px-3 py-0.5 rounded-full bg-white border border-slate-200 text-[#1E2A38] font-bold text-[10px]">
                    {currentProject.goal.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#1E2A38] tracking-tight leading-snug font-sans">
                    {currentProject.title}
                  </h2>
                  <p className="font-mono text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {currentProject.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/80 font-mono text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">ROLES NEEDED</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProject.rolesNeeded.map((role) => (
                      <span key={role} className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[#1E2A38] font-bold text-[11px]">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-mono border-t border-slate-200/80">
                  <div className="text-slate-500">
                    <span>AUTHOR: </span>
                    <span className="font-bold text-[#1E2A38]">{activeProfile.name}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('post-project')}
                    className="text-xs font-bold text-[#1E2A38] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Upload New</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Perspective Switcher Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs font-mono">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5 uppercase font-bold">
                  <span className="text-[#1E2A38]">SWITCH PERSPECTIVE ({profiles.length})</span>
                  <span className="text-[10px] text-indigo-700">DEMO MODE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs max-h-56 overflow-y-auto pr-1">
                  {profiles.map((p) => {
                    const isSelected = p.id === activeUserId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectActiveUser(p.id)}
                        className={`p-2 rounded-2xl text-left transition cursor-pointer border flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#4A154B] text-white border-[#4A154B] font-bold shadow-2xs'
                            : 'bg-[#FAF5F8] border-purple-100 text-[#4A154B] hover:bg-purple-100'
                        }`}
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-7 h-7 rounded-full bg-white border border-purple-200 object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs truncate">{p.name.split(' ')[0]}</div>
                          <div className={`text-[9px] truncate ${isSelected ? 'text-purple-200' : 'text-purple-400'}`}>
                            {p.department.split(' ')[0]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Main Canvas (8 cols): Compact Low-Scroll Collaborator Cards */}
            <div className="lg:col-span-8">
              <ProjectCollaboratorList
                project={currentProject}
                profiles={profiles}
                matches={matches}
                activeUserId={activeUserId}
                isLoadingMatches={isLoadingMatches}
                matchError={matchError}
                onRefreshMatches={() => fetchMatchesForProject(currentProject, profiles)}
                onToggleInterested={handleToggleInterested}
                onSelectActiveUser={handleSelectActiveUser}
                onSelectSparkSession={(m) => {
                  setSelectedMatchForSpark(m);
                  if (!sparkSessions[m.id]) {
                    handleGenerateSpark(m);
                  }
                  setActiveTab('spark');
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Project View */}
        {activeTab === 'post-project' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <PostProjectView
              currentUserId={activeUserId}
              onProjectPosted={handleProjectPosted}
              onTriggerMatch={() => setActiveTab('projects')}
            />
          </div>
        )}

        {/* PhD Scholars & Research Hub View */}
        {activeTab === 'phd' && (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            <PhdScholarsView
              profiles={profiles}
              activeUserId={activeUserId}
              onSelectActiveUser={handleSelectActiveUser}
              onToggleInterested={handleToggleInterested}
              onSelectSparkSession={(m) => {
                setSelectedMatchForSpark(m);
                if (!sparkSessions[m.id]) {
                  handleGenerateSpark(m);
                }
                setActiveTab('spark');
              }}
              onPostResearchRequirement={(newProj) => {
                handleProjectPosted(newProj);
                setActiveTab('projects');
              }}
            />
          </div>
        )}

        {/* Profile & Schedule View */}
        {activeTab === 'profile' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <ProfileView
              currentProfile={activeProfile}
              onSaveProfile={handleSaveProfile}
            />
          </div>
        )}

        {/* Mutual Spark Contacts View */}
        {activeTab === 'spark' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {selectedMatchForSpark ? (
              <SparkSessionView
                project={currentProject}
                match={selectedMatchForSpark}
                profiles={profiles}
                sparkData={sparkSessions[selectedMatchForSpark.id] || null}
                isLoadingSpark={isLoadingSpark}
                onGenerateSpark={handleGenerateSpark}
                onUpdateDecision={handleUpdateSparkDecision}
                onExitOrResetMatch={handleExitOrResetMatch}
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-3 font-mono">
                <div className="text-base font-bold text-[#1E2A38]">NO MUTUAL MATCH UNLOCKED YET</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Confirm interest on a project match card from both owner and candidate view to reveal email contacts and launch kickoff agendas.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="px-6 py-2.5 rounded-xl bg-[#1E2A38] text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  VIEW PROJECTS & MATCHES
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
