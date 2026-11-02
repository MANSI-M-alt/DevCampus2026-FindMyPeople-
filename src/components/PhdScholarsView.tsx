import React, { useState } from 'react';
import { StudentProfile, Project, MatchResult } from '../types';
import { Sparkles, Search, Filter, BookOpen, GraduationCap, ExternalLink, Plus, Send, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface PhdScholarsViewProps {
  profiles: StudentProfile[];
  activeUserId: string;
  onSelectActiveUser: (userId: string) => void;
  onToggleInterested: (matchId: string, isAuthorAction: boolean) => void;
  onSelectSparkSession: (match: MatchResult) => void;
  onPostResearchRequirement: (newProject: Project) => void;
}

export const PhdScholarsView: React.FC<PhdScholarsViewProps> = ({
  profiles,
  activeUserId,
  onSelectActiveUser,
  onToggleInterested,
  onSelectSparkSession,
  onPostResearchRequirement,
}) => {
  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];

  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [levelFilter, setLevelFilter] = useState<'All' | 'PhD' | 'Masters'>('All');

  // AI Requirement Matcher State
  const [requirementText, setRequirementText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [aiMatches, setAiMatches] = useState<{ profileId: string; score: number; synergy: string }[] | null>(null);

  // New Research Requirement Modal
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqRoles, setReqRoles] = useState('');

  // Propose Research Collaboration Modal
  const [proposeTargetScholar, setProposeTargetScholar] = useState<StudentProfile | null>(null);
  const [proposalNote, setProposalNote] = useState('');
  const [proposalSentSuccess, setProposalSentSuccess] = useState(false);

  // Sample Research Requirement Prompts
  const sampleRequirements = [
    'Need a PhD scholar in biostatistics & PyTorch to analyze high-dimensional genomic datasets for a joint Nature Biotechnology submission.',
    'Seeking a PhD candidate in AI Ethics & IP Law to draft compliance frameworks for medical device software.',
    'Looking for a Quantum Physics PhD researcher experienced with Qiskit for hybrid classical-quantum molecular docking algorithms.',
  ];

  // Filter logic
  const phdScholars = profiles.filter((p) => {
    // Degree filter
    if (levelFilter === 'PhD' && !(p.isPhdCandidate || p.year === 'PhD')) return false;
    if (levelFilter === 'Masters' && p.year !== "Master's") return false;

    // Domain filter
    if (selectedDomain !== 'All') {
      const spec = (p.researchSpecialization || p.department || '').toLowerCase();
      if (selectedDomain === 'Quantum & AI' && !spec.includes('quantum') && !spec.includes('computer') && !spec.includes('ai')) return false;
      if (selectedDomain === 'Biomedical & Health' && !spec.includes('bio') && !spec.includes('clinical') && !spec.includes('health')) return false;
      if (selectedDomain === 'Law & Ethics' && !spec.includes('law') && !spec.includes('policy') && !spec.includes('ethics')) return false;
      if (selectedDomain === 'Mathematics' && !spec.includes('math') && !spec.includes('stat') && !spec.includes('data')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchDept = p.department.toLowerCase().includes(query);
      const matchSpec = (p.researchSpecialization || '').toLowerCase().includes(query);
      const matchSkills = p.skills.some((s) => s.toLowerCase().includes(query));
      const matchPrevProj = p.previousProjects?.some((prev) =>
        prev.title.toLowerCase().includes(query) || prev.description.toLowerCase().includes(query)
      );
      if (!matchName && !matchDept && !matchSpec && !matchSkills && !matchPrevProj) return false;
    }

    return true;
  });

  // AI PhD Matcher Handler
  const handleRunAiPhDMatch = async () => {
    if (!requirementText.trim()) return;
    setIsMatching(true);
    setAiMatches(null);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            id: 'phd-custom-req',
            title: 'PhD Research Requirement Query',
            description: requirementText,
            rolesNeeded: ['PhD Co-Author', 'Methodology Lead', 'Research Collaborator'],
            goal: 'research or publish',
            authorId: activeUserId,
          },
          profiles: profiles,
        }),
      });

      const data = await response.json();
      if (data.matches && Array.isArray(data.matches)) {
        setAiMatches(
          data.matches.map((m: any) => ({
            profileId: m.profileId,
            score: m.matchScore || 92,
            synergy: m.reason || 'High synergy in methodology & research domain.',
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleCreateResearchReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDesc.trim()) return;

    const newProj: Project = {
      id: `phd-req-${Date.now()}`,
      title: reqTitle.trim(),
      description: reqDesc.trim(),
      rolesNeeded: reqRoles ? reqRoles.split(',').map((r) => r.trim()).filter(Boolean) : ['PhD Co-Author'],
      goal: 'research or publish',
      authorId: activeUserId,
      createdAt: new Date().toISOString(),
    };

    onPostResearchRequirement(newProj);
    setShowRequirementModal(false);
    setReqTitle('');
    setReqDesc('');
    setReqRoles('');
  };

  // Propose Collaboration Handler
  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeTargetScholar) return;

    setProposalSentSuccess(true);
    setTimeout(() => {
      setProposalSentSuccess(false);
      setProposeTargetScholar(null);
      setProposalNote('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top PhD Hub Hero Banner */}
      <div className="bg-[#1E2A38] text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-950 border border-purple-800 text-purple-200 font-mono text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-purple-300" />
              <span>PHD SCHOLARS & RESEARCH HUB</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Connect with PhD Candidates & Interdisciplinary Researchers
            </h1>

            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              Find peer PhD scholars, post-docs, or specialized lab collaborators based on specific research project requirements, methodology tools, grant goals, and target publication venues.
            </p>
          </div>

          <button
            onClick={() => setShowRequirementModal(true)}
            className="px-5 py-3 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>POST RESEARCH REQUIREMENT</span>
          </button>
        </div>
      </div>

      {/* AI Research Requirement Search Bar */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-purple-950 font-bold">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-800" />
            <span>AI PHD REQUIREMENT MATCHER</span>
          </span>
          <span className="text-[10px] text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-300">
            POWERED BY GEMINI AI
          </span>
        </div>

        <p className="text-xs text-slate-700">
          State your exact research requirement or lab need to find scholars with complementary methodologies & paper goals:
        </p>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder="e.g. Need a PhD candidate in biostatistics or machine learning to co-author a Nature Biotech paper..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-[#1E2A38] focus:outline-none focus:ring-2 focus:ring-purple-900 font-mono font-bold"
            />
            <button
              onClick={handleRunAiPhDMatch}
              disabled={isMatching || !requirementText.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-950 text-white text-xs font-bold hover:bg-purple-900 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isMatching ? (
                <span>Matching Scholars...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>MATCH SCHOLARS</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1">
            <span className="text-slate-500 uppercase font-bold">TRY PROMPT:</span>
            {sampleRequirements.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setRequirementText(prompt)}
                className="px-2.5 py-1 rounded bg-white border border-purple-200 text-slate-800 hover:bg-purple-100 transition text-left cursor-pointer truncate max-w-xs font-bold"
              >
                "{prompt.slice(0, 45)}..."
              </button>
            ))}
          </div>
        </div>

        {/* AI Match Results Banner */}
        {aiMatches && (
          <div className="pt-3 space-y-2 border-t border-purple-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-purple-950 font-bold">
              <span>TOP AI-RECOMMENDED PHD SCHOLARS FOR YOUR REQUIREMENT ({aiMatches.length})</span>
              <button onClick={() => setAiMatches(null)} className="text-slate-500 hover:text-slate-800 text-[10px]">
                Clear Matches
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiMatches.map((match) => {
                const scholar = profiles.find((p) => p.id === match.profileId);
                if (!scholar) return null;
                return (
                  <div key={match.profileId} className="bg-white border border-purple-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E2A38]">{scholar.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {match.score}% MATCH
                      </span>
                    </div>

                    <div className="text-[10px] text-purple-900 font-bold">
                      {scholar.department} · {scholar.year}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      Synergy: {match.synergy}
                    </p>

                    <button
                      onClick={() => setProposeTargetScholar(scholar)}
                      className="w-full py-1.5 rounded-lg bg-[#1E2A38] hover:bg-slate-800 text-white text-[11px] font-bold transition text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3 text-indigo-300" />
                      <span>Connect & Propose Research</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search research topic, skill, paper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
          />
        </div>

        {/* Level Filter Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">LEVEL:</span>
          {(['All', 'PhD', 'Masters'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition border ${
                levelFilter === lvl
                  ? 'bg-[#1E2A38] text-white border-[#1E2A38]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lvl === 'PhD' ? 'PhD Scholars' : lvl === 'Masters' ? "Master's" : 'All Scholars'}
            </button>
          ))}
        </div>

        {/* Domain Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 font-bold uppercase text-[10px]">DOMAIN:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-[#1E2A38] focus:outline-none"
          >
            <option value="All">All Research Domains</option>
            <option value="Quantum & AI">Quantum Computing & AI</option>
            <option value="Biomedical & Health">Biomedical & Diagnostics</option>
            <option value="Law & Ethics">Law & Tech Policy</option>
            <option value="Mathematics">Applied Mathematics & Stats</option>
          </select>
        </div>
      </div>

      {/* Directory Grid of PhD Scholars & Researchers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-500 px-1 uppercase">
          <span>RESEARCHERS & SCHOLARS DIRECTORY ({phdScholars.length})</span>
          <span>DISCOVER BY PREVIOUS PUBLICATIONS & SKILLS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {phdScholars.map((scholar) => {
            const isPhd = scholar.isPhdCandidate || scholar.year === 'PhD';

            return (
              <div
                key={scholar.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-400 transition flex flex-col justify-between font-mono"
              >
                <div className="space-y-3">
                  {/* Top Header: Avatar, Name, Degree Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={scholar.avatar}
                        alt={scholar.name}
                        className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-0.5 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#1E2A38] tracking-tight">{scholar.name}</h3>
                          {isPhd && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-mono font-bold">
                              PhD
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-slate-500">
                          {scholar.department} · {scholar.year}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectActiveUser(scholar.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#1E2A38] font-mono text-[10px] font-bold transition cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Research Specialization & Lab if PhD */}
                  {scholar.researchSpecialization && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs space-y-1">
                      <div className="text-[10px] text-purple-900 font-bold uppercase">
                        RESEARCH SPECIALIZATION
                      </div>
                      <p className="font-bold text-purple-950 text-xs">
                        {scholar.researchSpecialization}
                      </p>
                      {scholar.advisorLab && (
                        <div className="text-[10px] text-purple-800">
                          Lab: {scholar.advisorLab}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {scholar.bio}
                  </p>

                  {/* Primary Skills Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">TECHNICAL & LAB SKILLS</span>
                    <div className="flex flex-wrap gap-1">
                      {scholar.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#1E2A38] text-[11px] font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* PREVIOUS COMPLETED RESEARCH / PUBLICATIONS SHOWCASE */}
                  {scholar.previousProjects && scholar.previousProjects.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                        <span>PREVIOUS RESEARCH & PUBLICATIONS ({scholar.previousProjects.length})</span>
                      </span>

                      <div className="space-y-2">
                        {scholar.previousProjects.map((prev) => (
                          <div key={prev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold text-[#1E2A38]">
                              <span className="truncate pr-2">{prev.title}</span>
                              {prev.year && <span className="text-[10px] text-slate-500">{prev.year}</span>}
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              {prev.description}
                            </p>

                            {prev.outcomes && (
                              <div className="text-[10px] text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                                Outcome: {prev.outcomes}
                              </div>
                            )}

                            {prev.link && (
                              <a
                                href={prev.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-indigo-700 hover:underline font-bold block pt-0.5"
                              >
                                <span>Read Paper</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Card */}
                <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    GOAL: <span className="text-[#1E2A38] uppercase">{scholar.goal}</span>
                  </span>

                  <button
                    onClick={() => setProposeTargetScholar(scholar)}
                    className="px-4 py-2.5 rounded-xl bg-[#1E2A38] hover:bg-slate-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-indigo-300" />
                    <span>CONNECT & PROPOSE RESEARCH</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Propose Research Collaboration Modal */}
      {proposeTargetScholar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E2A38] uppercase">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>PROPOSE RESEARCH COLLABORATION</span>
              </div>
              <button
                onClick={() => setProposeTargetScholar(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {proposalSentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
                <div className="text-sm font-bold text-[#1E2A38]">PROPOSAL SENT SUCCESSFULLY</div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your research proposal has been delivered to {proposeTargetScholar.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <div className="font-bold text-[#1E2A38]">{proposeTargetScholar.name}</div>
                  <div className="text-slate-500 text-[10px]">
                    {proposeTargetScholar.department} · {proposeTargetScholar.year}
                  </div>
                  {proposeTargetScholar.researchSpecialization && (
                    <div className="text-purple-900 text-[10px] font-bold">
                      {proposeTargetScholar.researchSpecialization}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                    Research Collaboration Note *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={`Describe your research project, role offer, or publication co-authorship goal for ${proposeTargetScholar.name.split(' ')[0]}...`}
                    value={proposalNote}
                    onChange={(e) => setProposalNote(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-[#1E2A38] focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProposeTargetScholar(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1E2A38] text-white font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND RESEARCH PROPOSAL</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post PhD Research Requirement Modal */}
      {showRequirementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-[#1E2A38] uppercase">
                <GraduationCap className="w-5 h-5 text-purple-900" />
                <span>POST PHD RESEARCH REQUIREMENT</span>
              </div>
              <button
                onClick={() => setShowRequirementModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResearchReq} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                  Research Title / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Topological Data Analysis for Single-Cell RNA Sequencing"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                  Target Roles / Complementary Disciplines *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PhD Biostatistician, PyTorch Developer, Clinical Epidemiologist"
                  value={reqRoles}
                  onChange={(e) => setReqRoles(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38]"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                  Detailed Project / Research Requirements & Paper Target *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your lab objectives, dataset availability, methodology requirements, and publication venue (e.g. NeurIPS, IEEE, Nature)..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-[#1E2A38]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequirementModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E2A38] text-white font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  POST RESEARCH CALL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
