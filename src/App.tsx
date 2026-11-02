import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { MatchResult, Project, SparkSessionData, StudentProfile } from './types';
import { HeaderNav, NavTab } from './components/HeaderNav';
import { ProjectCollaboratorList } from './components/ProjectCollaboratorList';
import { ProfileView } from './components/ProfileView';
import { PostProjectView } from './components/PostProjectView';
import { SparkSessionView } from './components/SparkSessionView';
import { PhdScholarsView } from './components/PhdScholarsView';
import { AuthView } from './components/AuthView';
import { supabase } from './lib/supabase';
import { Plus } from 'lucide-react';

interface ProfileRow {
  id: string;
  name: string;
  department: string;
  year: string;
  avatar: string;
  bio: string;
  skills: string[];
  interests: string[];
  goal: StudentProfile['goal'];
  free_slots: string[];
  is_phd_candidate: boolean;
  research_specialization: string | null;
  advisor_lab: string | null;
  previous_projects: StudentProfile['previousProjects'];
}

interface ProjectRow {
  id: string;
  author_id: string;
  title: string;
  description: string;
  roles_needed: string[];
  goal: Project['goal'];
  created_at: string;
}

interface MatchRow {
  id: string;
  project_id: string;
  profile_id: string;
  match_score: number;
  reason: string;
  complementary_skill: string;
  goal_alignment: MatchResult['goalAlignment'];
  goal_alignment_note: string;
  risk: string;
  interested_by_author: boolean;
  interested_by_candidate: boolean;
}

const mapProfile = (row: ProfileRow, ownEmail: string): StudentProfile => ({
  id: row.id,
  name: row.name,
  department: row.department,
  year: row.year,
  email: ownEmail,
  avatar: row.avatar,
  bio: row.bio,
  skills: row.skills ?? [],
  interests: row.interests ?? [],
  goal: row.goal,
  freeSlots: row.free_slots ?? [],
  isPhdCandidate: row.is_phd_candidate,
  researchSpecialization: row.research_specialization ?? undefined,
  advisorLab: row.advisor_lab ?? undefined,
  previousProjects: row.previous_projects ?? [],
});

const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  rolesNeeded: row.roles_needed ?? [],
  goal: row.goal,
  authorId: row.author_id,
  createdAt: row.created_at,
});

const mapMatch = (row: MatchRow): MatchResult => ({
  id: row.id,
  projectId: row.project_id,
  profileId: row.profile_id,
  matchScore: row.match_score,
  reason: row.reason,
  complementarySkill: row.complementary_skill,
  goalAlignment: row.goal_alignment,
  goalAlignmentNote: row.goal_alignment_note,
  risk: row.risk,
  interestedByAuthor: row.interested_by_author,
  interestedByCandidate: row.interested_by_candidate,
  isMutual: row.interested_by_author && row.interested_by_candidate,
});

const getSupabaseErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as { code?: string; message?: string };
    if (supabaseError.code === 'PGRST205' || supabaseError.code === '42P01') {
      return 'Supabase tables are not set up yet. Open the Supabase SQL Editor and run supabase/schema.sql from this project, then reload the app.';
    }
    if (supabaseError.message) return supabaseError.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('projects');
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [selectedMatchForSpark, setSelectedMatchForSpark] = useState<MatchResult | null>(null);
  const [sparkSessions, setSparkSessions] = useState<Record<string, SparkSessionData>>({});
  const [isLoadingSpark, setIsLoadingSpark] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setDataError(error.message);
      setSession(data.session);
      setIsAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfiles([]);
      setProjects([]);
      setMatches([]);
      setDataError(null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setProfiles([]);
      setProjects([]);
      setIsLoadingData(false);
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const [profileResult, projectResult] = await Promise.all([
          supabase.from('profiles').select('*').order('name'),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (projectResult.error) throw projectResult.error;

        let profileRows = profileResult.data as ProfileRow[];
        if (!profileRows.some((row) => row.id === session.user.id)) {
          const defaultName = session.user.user_metadata.name
            || session.user.email?.split('@')[0]
            || 'New student';
          const { data: createdProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              name: defaultName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultName)}`,
            })
            .select('*')
            .single();
          if (createProfileError) throw createProfileError;
          profileRows = [...profileRows, createdProfile as ProfileRow];
        }

        const loadedProfiles = profileRows.map((row) =>
          mapProfile(row, row.id === session.user.id ? session.user.email ?? '' : '')
        );
        const loadedProjects = (projectResult.data as ProjectRow[]).map(mapProject);
        if (!cancelled) {
          setProfiles(loadedProfiles);
          setProjects(loadedProjects);
          setSelectedProjectId((current) =>
            current && loadedProjects.some((project) => project.id === current)
              ? current
              : loadedProjects.find((project) => project.authorId === session.user.id)?.id ??
                loadedProjects[0]?.id ??
                null
          );
        }
      } catch (error) {
        if (!cancelled) {
          setDataError(getSupabaseErrorMessage(error, 'Could not load Supabase data.'));
        }
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const activeProfile = profiles.find((profile) => profile.id === session?.user.id);
  const currentProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );
  const mutualMatches = matches.filter((match) => match.isMutual);

  const generateMatches = async (project: Project) => {
    if (!session || project.authorId !== session.user.id) {
      setMatchError('Only the project owner can generate recommendations.');
      return;
    }

    setIsLoadingMatches(true);
    setMatchError(null);
    try {
      const candidates = profiles.filter((profile) => profile.id !== session.user.id);
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, profiles: candidates }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate matches.');

      const generatedMatches = Array.isArray(result.matches) ? result.matches as Array<{
        profileId: string;
        matchScore: number;
        reason: string;
        complementarySkill: string;
        goalAlignment: MatchResult['goalAlignment'];
        goalAlignmentNote: string;
        risk: string;
      }> : [];
      const matchRows = generatedMatches.filter((match) =>
        typeof match.profileId === 'string' && candidates.some((profile) => profile.id === match.profileId)
      )
        .map((match) => ({
          project_id: project.id,
          profile_id: match.profileId,
          match_score: Math.max(0, Math.min(100, Math.round(match.matchScore ?? 85))),
          reason: match.reason || 'Potential fit based on the profile and project details.',
          complementary_skill: match.complementarySkill || 'Complementary skills',
          goal_alignment: ['strong', 'partial', 'weak'].includes(match.goalAlignment) ? match.goalAlignment : 'partial',
          goal_alignment_note: match.goalAlignmentNote || 'Review shared goals together.',
          risk: match.risk || 'Confirm availability and expectations.',
        }));

      if (matchRows.length > 0) {
        const { error } = await supabase
          .from('project_matches')
          .upsert(matchRows, { onConflict: 'project_id,profile_id' });
        if (error) throw error;
      }

      const { data, error } = await supabase
        .from('project_matches')
        .select('*')
        .eq('project_id', project.id);
      if (error) throw error;
      setMatches((data as MatchRow[]).map(mapMatch));
    } catch (error) {
      setMatchError(getSupabaseErrorMessage(error, 'Could not generate recommendations.'));
    } finally {
      setIsLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (!session || !currentProject || profiles.length === 0) {
      setMatches([]);
      return;
    }

    let cancelled = false;
    const loadMatches = async () => {
      setIsLoadingMatches(true);
      setMatchError(null);
      try {
        let query = supabase.from('project_matches').select('*').eq('project_id', currentProject.id);
        if (currentProject.authorId !== session.user.id) {
          query = query.eq('profile_id', session.user.id);
        }
        const { data, error } = await query;
        if (error) throw error;
        if (cancelled) return;

        if (data.length > 0 || currentProject.authorId !== session.user.id) {
          setMatches((data as MatchRow[]).map(mapMatch));
        } else {
          await generateMatches(currentProject);
        }
      } catch (error) {
        if (!cancelled) setMatchError(getSupabaseErrorMessage(error, 'Could not load matches.'));
      } finally {
        if (!cancelled) setIsLoadingMatches(false);
      }
    };
    void loadMatches();
    return () => {
      cancelled = true;
    };
  }, [session, currentProject, profiles.length]);

  const handleSaveProfile = async (updatedProfile: StudentProfile) => {
    if (!session) return;
    const { error } = await supabase.from('profiles').update({
      name: updatedProfile.name,
      department: updatedProfile.department,
      year: updatedProfile.year,
      avatar: updatedProfile.avatar,
      bio: updatedProfile.bio,
      skills: updatedProfile.skills,
      interests: updatedProfile.interests,
      goal: updatedProfile.goal,
      free_slots: updatedProfile.freeSlots,
      is_phd_candidate: updatedProfile.isPhdCandidate ?? false,
      research_specialization: updatedProfile.researchSpecialization ?? null,
      advisor_lab: updatedProfile.advisorLab ?? null,
      previous_projects: updatedProfile.previousProjects ?? [],
      updated_at: new Date().toISOString(),
    }).eq('id', session.user.id);
    if (error) throw error;
    setProfiles((previous) => previous.map((profile) =>
      profile.id === session.user.id ? { ...updatedProfile, email: session.user.email ?? '' } : profile
    ));
  };

  const handleProjectPosted = async (newProject: Project) => {
    if (!session) return;
    const { data, error } = await supabase.from('projects').insert({
      author_id: session.user.id,
      title: newProject.title,
      description: newProject.description,
      roles_needed: newProject.rolesNeeded,
      goal: newProject.goal,
    }).select('*').single();
    if (error) throw error;
    const project = mapProject(data as ProjectRow);
    setProjects((previous) => [project, ...previous]);
    setSelectedProjectId(project.id);
    setActiveTab('projects');
  };

  const handleToggleInterested = async (matchId: string) => {
    if (!session || !currentProject) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match) return;
    const isAuthor = currentProject.authorId === session.user.id;
    const column = isAuthor ? 'interested_by_author' : 'interested_by_candidate';
    const updatedValue = isAuthor ? !match.interestedByAuthor : !match.interestedByCandidate;
    const { error } = await supabase.from('project_matches')
      .update({ [column]: updatedValue })
      .eq('id', matchId);
    if (error) {
      setMatchError(error.message);
      return;
    }
    setMatches((previous) => previous.map((item) => {
      if (item.id !== matchId) return item;
      const authorInterest = isAuthor ? updatedValue : item.interestedByAuthor;
      const candidateInterest = isAuthor ? item.interestedByCandidate : updatedValue;
      const updated = {
        ...item,
        interestedByAuthor: authorInterest,
        interestedByCandidate: candidateInterest,
        isMutual: authorInterest && candidateInterest,
      };
      if (updated.isMutual) setSelectedMatchForSpark(updated);
      return updated;
    }));
  };

  const handleGenerateSpark = async (match: MatchResult) => {
    if (!currentProject || !session) return;
    const author = profiles.find((profile) => profile.id === currentProject.authorId);
    const candidate = profiles.find((profile) => profile.id === match.profileId);
    if (!author || !candidate) return;

    const instantKit: SparkSessionData = {
      matchId: match.id,
      icebreaker: `What inspired both of you to collaborate on "${currentProject.title}"?`,
      fitQuestions: [
        'What is your realistic weekly time commitment?',
        'How should you divide responsibilities?',
        'What milestone would make this collaboration successful?',
      ],
      agenda: [
        { time: '0-3 min', topic: 'Introductions and project vision' },
        { time: '3-10 min', topic: 'Skills and responsibilities' },
        { time: '10-17 min', topic: 'Availability and work rhythms' },
        { time: '17-20 min', topic: 'Decisions and next steps' },
      ],
      suggestedMeetingTimes: [],
    };
    setSparkSessions((previous) => ({ ...previous, [match.id]: previous[match.id] ?? instantKit }));
    setIsLoadingSpark(true);
    try {
      const { data: contacts, error: contactError } = await supabase
        .rpc('get_mutual_match_emails', { p_match_id: match.id });
      if (contactError) throw contactError;
      const contact = (contacts as Array<{ author_email: string; candidate_email: string }> | null)?.[0];
      if (contact) {
        setProfiles((previous) => previous.map((profile) => ({
          ...profile,
          email: profile.id === author.id
            ? contact.author_email
            : profile.id === candidate.id ? contact.candidate_email : profile.email,
        })));
      }

      const response = await fetch('/api/spark-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: currentProject, authorProfile: author, candidateProfile: candidate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate a Spark Session.');
      if (result.sparkKit) {
        setSparkSessions((previous) => ({
          ...previous,
          [match.id]: { ...instantKit, ...result.sparkKit, matchId: match.id },
        }));
      }
    } catch (error) {
      setMatchError(error instanceof Error ? error.message : 'Could not generate a Spark Session.');
    } finally {
      setIsLoadingSpark(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setDataError(error.message);
  };

  if (!isAuthReady) {
    return <main className="min-h-screen grid place-items-center text-slate-600">Connecting to Supabase…</main>;
  }
  if (!session) return <AuthView />;

  if (isLoadingData || !activeProfile) {
    return (
      <main className="min-h-screen bg-[#FAF5F8] p-8 text-center text-slate-600">
        {dataError ? <p role="alert" className="text-rose-700">{dataError}</p> : 'Loading your FindMyPeople workspace…'}
      </main>
    );
  }

  const handleExitOrResetMatch = (matchId: string, removeMatch = false) => {
    setSelectedMatchForSpark(null);
    const match = matches.find((item) => item.id === matchId);
    const ownInterest = currentProject?.authorId === session.user.id
      ? match?.interestedByAuthor
      : match?.interestedByCandidate;
    if (removeMatch && ownInterest) void handleToggleInterested(matchId);
    setActiveTab('projects');
  };

  const handleUpdateSparkDecision = (
    authorDecision?: 'build' | 'pass',
    candidateDecision?: 'build' | 'pass'
  ) => {
    if (!selectedMatchForSpark) return;
    const matchId = selectedMatchForSpark.id;
    setSparkSessions((previous) => {
      const existing = previous[matchId] ?? {
        matchId,
        icebreaker: 'What inspired both of you to collaborate?',
        fitQuestions: ['What is your weekly time commitment?', 'How will you divide responsibilities?'],
        agenda: [],
        suggestedMeetingTimes: [],
      };
      return {
        ...previous,
        [matchId]: {
          ...existing,
          ...(authorDecision ? { authorDecision } : {}),
          ...(candidateDecision ? { candidateDecision } : {}),
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF5F8] text-[#4A154B] font-sans">
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mutualCount={mutualMatches.length}
        email={session.user.email ?? ''}
        onSignOut={() => void handleSignOut()}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {dataError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{dataError}</p>}

        {activeTab === 'projects' && (
          currentProject ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#1E2A38]">Project</span>
                    <button
                      onClick={() => setActiveTab('post-project')}
                      className="flex items-center gap-1 text-xs font-bold text-[#1E2A38]"
                    >
                      <Plus className="h-4 w-4" /> New
                    </button>
                  </div>
                  {projects.length > 1 && (
                    <select
                      aria-label="Select project"
                      value={currentProject.id}
                      onChange={(event) => setSelectedProjectId(event.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.title}</option>
                      ))}
                    </select>
                  )}
                  <h1 className="text-lg font-bold text-[#1E2A38]">{currentProject.title}</h1>
                  <p className="text-sm text-slate-600">{currentProject.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.rolesNeeded.map((role) => (
                      <span key={role} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs">{role}</span>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Posted by {profiles.find((profile) => profile.id === currentProject.authorId)?.name ?? 'Student'}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm">
                  <div className="font-bold text-[#1E2A38]">{activeProfile.name}</div>
                  <div className="mt-1 text-slate-500">{activeProfile.department} · {activeProfile.year}</div>
                  <button onClick={() => setActiveTab('profile')} className="mt-3 font-semibold text-indigo-700 underline">Edit profile</button>
                </div>
              </aside>
              <section className="lg:col-span-8">
                <ProjectCollaboratorList
                  project={currentProject}
                  profiles={profiles}
                  matches={matches}
                  activeUserId={session.user.id}
                  isLoadingMatches={isLoadingMatches}
                  matchError={matchError}
                  onRefreshMatches={() => void generateMatches(currentProject)}
                  onToggleInterested={(matchId) => void handleToggleInterested(matchId)}
                  onSelectSparkSession={(match) => {
                    setSelectedMatchForSpark(match);
                    setActiveTab('spark');
                    void handleGenerateSpark(match);
                  }}
                />
              </section>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h1 className="text-xl font-bold text-[#1E2A38]">No projects yet</h1>
              <p className="mt-2 text-sm text-slate-500">Post the first project to start finding collaborators.</p>
              <button onClick={() => setActiveTab('post-project')} className="mt-5 rounded-xl bg-[#1E2A38] px-4 py-2 text-sm font-bold text-white">
                Post a project
              </button>
            </div>
          )
        )}

        {activeTab === 'post-project' && (
          <div className="mx-auto max-w-4xl">
            <PostProjectView
              currentUserId={session.user.id}
              onProjectPosted={handleProjectPosted}
              onTriggerMatch={() => setActiveTab('projects')}
            />
          </div>
        )}

        {activeTab === 'phd' && (
          <PhdScholarsView
            profiles={profiles}
            activeUserId={session.user.id}
            onPostResearchRequirement={handleProjectPosted}
          />
        )}

        {activeTab === 'profile' && (
          <div className="mx-auto max-w-6xl">
            <ProfileView currentProfile={activeProfile} onSaveProfile={handleSaveProfile} />
          </div>
        )}

        {activeTab === 'spark' && (
          <div className="mx-auto max-w-6xl">
            {selectedMatchForSpark && currentProject ? (
              <SparkSessionView
                project={currentProject}
                match={selectedMatchForSpark}
                profiles={profiles}
                sparkData={sparkSessions[selectedMatchForSpark.id] ?? null}
                isLoadingSpark={isLoadingSpark}
                onGenerateSpark={(match) => void handleGenerateSpark(match)}
                onUpdateDecision={handleUpdateSparkDecision}
                onExitOrResetMatch={handleExitOrResetMatch}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="font-bold text-[#1E2A38]">No mutual match selected</h2>
                <p className="mt-2 text-sm text-slate-500">Both collaborators need to express interest before starting a Spark Session.</p>
                <button onClick={() => setActiveTab('projects')} className="mt-4 font-bold text-indigo-700 underline">Back to projects</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
