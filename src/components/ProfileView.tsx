import React, { useState, useEffect } from 'react';
import { StudentProfile, Goal, PreviousProject } from '../types';
import { DAYS_OF_WEEK, TIMES_OF_DAY } from '../seedData';
import { Check, Plus, X, User, Calendar, Sparkles, FolderGit2, ExternalLink, Trash2, GraduationCap, Award } from 'lucide-react';

interface ProfileViewProps {
  currentProfile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentProfile, onSaveProfile }) => {
  const [bioInput, setBioInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<StudentProfile>({ ...currentProfile });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Previous Projects Form State
  const [showAddPrevProj, setShowAddPrevProj] = useState(false);
  const [prevTitle, setPrevTitle] = useState('');
  const [prevDesc, setPrevDesc] = useState('');
  const [prevRole, setPrevRole] = useState('');
  const [prevYear, setPrevYear] = useState('2025');
  const [prevTechs, setPrevTechs] = useState('');
  const [prevOutcomes, setPrevOutcomes] = useState('');
  const [prevLink, setPrevLink] = useState('');

  // Update formData when currentProfile changes
  useEffect(() => {
    setFormData({ ...currentProfile });
  }, [currentProfile]);

  const handleExtractFromBio = async () => {
    if (!bioInput.trim()) return;
    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch('/api/profile/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioText: bioInput }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract profile.');
      }

      if (data.profile) {
        setFormData((prev) => ({
          ...prev,
          name: data.profile.name || prev.name,
          department: data.profile.department || prev.department,
          year: data.profile.year || prev.year,
          skills: data.profile.skills || prev.skills,
          interests: data.profile.interests || prev.interests,
          goal: (data.profile.goal as Goal) || prev.goal,
          bio: bioInput,
        }));
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || 'An error occurred during extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleSlot = (slotKey: string) => {
    setFormData((prev) => {
      const exists = prev.freeSlots.includes(slotKey);
      const updatedSlots = exists
        ? prev.freeSlots.filter((s) => s !== slotKey)
        : [...prev.freeSlots, slotKey];
      return { ...prev, freeSlots: updatedSlots };
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (!formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
  };

  // Add Previous Project Handler
  const handleAddPreviousProject = () => {
    if (!prevTitle.trim() || !prevDesc.trim()) return;
    const newProj: PreviousProject = {
      id: `prev-${Date.now()}`,
      title: prevTitle.trim(),
      description: prevDesc.trim(),
      role: prevRole.trim() || 'Contributor / Researcher',
      year: prevYear.trim() || '2025',
      technologies: prevTechs ? prevTechs.split(',').map((t) => t.trim()).filter(Boolean) : [],
      outcomes: prevOutcomes.trim() || undefined,
      link: prevLink.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      previousProjects: [...(prev.previousProjects || []), newProj],
    }));

    setPrevTitle('');
    setPrevDesc('');
    setPrevRole('');
    setPrevTechs('');
    setPrevOutcomes('');
    setPrevLink('');
    setShowAddPrevProj(false);
  };

  const handleRemovePreviousProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      previousProjects: (prev.previousProjects || []).filter((p) => p.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const goalOptions: { value: Goal; label: string; desc: string }[] = [
    { value: 'start a startup', label: 'Start a Startup', desc: 'Commercialize ideas into real ventures' },
    { value: 'win a hackathon', label: 'Win a Hackathon', desc: 'High speed build for competitive events' },
    { value: 'build a portfolio', label: 'Build a Portfolio', desc: 'Create polished flagship projects' },
    { value: 'learn something new', label: 'Learn Something New', desc: 'Explore new tech outside my major' },
    { value: 'research or publish', label: 'Research or Publish', desc: 'Academic papers & technical research' },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Extract Bio Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="font-bold text-[#1E2A38] uppercase">AUTO-EXTRACT PROFILE WITH GEMINI</span>
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>

        <p className="font-mono text-xs text-slate-600 leading-relaxed">
          Paste your raw bio, resume, or research summary text. Gemini will parse your department, skills, interests, and primary goal automatically.
        </p>

        <div className="space-y-3">
          <textarea
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            rows={3}
            placeholder="e.g. 'I am a 3rd year PhD student in Computational Biology working on single-cell RNA sequencing models. I have experience in PyTorch and R...'"
            className="w-full p-4 rounded-xl bg-white border border-slate-200 text-xs font-mono text-[#1E2A38] focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
          />

          <div className="flex items-center justify-between font-mono">
            {extractError && (
              <span className="text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded">
                Error: {extractError}
              </span>
            )}
            <button
              type="button"
              onClick={handleExtractFromBio}
              disabled={isExtracting || !bioInput.trim()}
              className="ml-auto px-5 py-2 rounded-xl bg-[#1E2A38] text-white text-xs font-bold transition hover:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isExtracting ? (
                <span>Extracting...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>EXTRACT PROFILE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="text-base font-bold text-[#1E2A38] border-b border-dashed border-slate-200 pb-3 flex items-center justify-between font-mono uppercase">
            <span>PROFILE DETAILS & ACADEMIC LEVEL</span>
            {formData.year === 'PhD' && (
              <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold">
                PhD SCHOLAR
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold focus:ring-2 focus:ring-[#1E2A38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold focus:ring-2 focus:ring-[#1E2A38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Academic Level / Year</label>
              <select
                value={formData.year}
                onChange={(e) => {
                  const isPhd = e.target.value === 'PhD';
                  setFormData({ ...formData, year: e.target.value, isPhdCandidate: isPhd });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold focus:ring-2 focus:ring-[#1E2A38] focus:outline-none bg-white"
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Master's">Master's</option>
                <option value="PhD">PhD Candidate / Scholar</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Campus Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[#1E2A38] font-bold focus:ring-2 focus:ring-[#1E2A38] focus:outline-none"
              />
            </div>
          </div>

          {/* PhD Research Special Fields if PhD */}
          {(formData.year === 'PhD' || formData.isPhdCandidate) && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="font-bold text-purple-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-800" />
                <span>PHD RESEARCH COLLABORATION DETAILS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-900 font-bold text-[10px] uppercase mb-1">
                    Research Specialization / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Variational Quantum Algorithms & Machine Learning"
                    value={formData.researchSpecialization || ''}
                    onChange={(e) => setFormData({ ...formData, researchSpecialization: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 text-purple-950 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-900 font-bold text-[10px] uppercase mb-1">
                    Lab / Advisor Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quantum Systems & Neural Hardware Lab"
                    value={formData.advisorLab || ''}
                    onChange={(e) => setFormData({ ...formData, advisorLab: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 text-purple-950 font-bold bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Goals */}
          <div className="space-y-2 pt-2">
            <label className="block font-mono text-[10px] text-slate-400 font-bold uppercase">Primary Goal</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {goalOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, goal: opt.value })}
                  className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer ${
                    formData.goal === opt.value
                      ? 'bg-[#1E2A38] text-white border-[#1E2A38]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills & Interests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="space-y-2">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">Skills</label>
              <div className="flex flex-wrap gap-1">
                {formData.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 font-bold text-[#1E2A38]">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="p-0.5">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-lg bg-[#1E2A38] text-white font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">Interests</label>
              <div className="flex flex-wrap gap-1">
                {formData.interests.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 font-bold text-[#1E2A38]">
                    {i}
                    <button type="button" onClick={() => handleRemoveInterest(i)} className="p-0.5">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add interest..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-3 py-1.5 rounded-lg bg-[#1E2A38] text-white font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PREVIOUS COMPLETED PROJECTS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3 font-mono">
            <div>
              <div className="text-base font-bold text-[#1E2A38] uppercase flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-800" />
                <span>PREVIOUS COMPLETED PROJECTS & PUBLICATIONS</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Showcase past projects, papers, hackathon builds, or software toolkits you have completed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPrevProj(!showAddPrevProj)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E2A38] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddPrevProj ? 'Close' : 'Add Project'}</span>
            </button>
          </div>

          {/* Add Previous Project Form */}
          {showAddPrevProj && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs animate-in fade-in duration-200">
              <div className="font-bold text-[#1E2A38] uppercase">ADD A COMPLETED PROJECT / PUBLICATION</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PulseCheck Offline Mobile App"
                    value={prevTitle}
                    onChange={(e) => setPrevTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Your Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Developer / PhD Primary Author"
                    value={prevRole}
                    onChange={(e) => setPrevRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Year / Timeline</label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={prevYear}
                    onChange={(e) => setPrevYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Technologies / Lab Methods (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. PyTorch, Qiskit, React Native"
                    value={prevTechs}
                    onChange={(e) => setPrevTechs(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Project Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary of what was built or discovered..."
                  value={prevDesc}
                  onChange={(e) => setPrevDesc(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Key Outcomes / Citations</label>
                  <input
                    type="text"
                    placeholder="e.g. Published in IEEE; 1,000+ active users"
                    value={prevOutcomes}
                    onChange={(e) => setPrevOutcomes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Link / Paper URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={prevLink}
                    onChange={(e) => setPrevLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPrevProj(false)}
                  className="px-4 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPreviousProject}
                  disabled={!prevTitle.trim() || !prevDesc.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#1E2A38] text-white font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </div>
          )}

          {/* List of Previous Projects */}
          {(!formData.previousProjects || formData.previousProjects.length === 0) ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl font-mono text-xs text-slate-500">
              No previous projects added yet. Click "Add Project" above to showcase your past research papers or apps!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              {formData.previousProjects.map((p) => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 relative group hover:border-slate-300 transition">
                  <button
                    type="button"
                    onClick={() => handleRemovePreviousProject(p.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 pr-6">
                    <span className="text-xs font-bold text-[#1E2A38]">{p.title}</span>
                    {p.year && (
                      <span className="text-[10px] px-2 py-0.2 rounded bg-white border border-slate-200 font-bold text-slate-600">
                        {p.year}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 font-bold">
                    Role: <span className="text-[#1E2A38]">{p.role}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technologies.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.outcomes && (
                    <div className="text-[10px] text-emerald-900 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Outcome: {p.outcomes}
                    </div>
                  )}

                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:underline font-bold pt-1"
                    >
                      <span>View Paper / Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free Time Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-mono">
          <div className="text-base font-bold text-[#1E2A38] border-b border-dashed border-slate-200 pb-3 flex items-center justify-between uppercase">
            <span>WEEKLY AVAILABILITY GRID</span>
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded font-bold">
              {formData.freeSlots.length} SLOTS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                  <th className="py-2.5 px-3 w-32 font-bold">Time</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d.key} className="py-2.5 px-2 text-center font-bold">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TIMES_OF_DAY.map((time) => (
                  <tr key={time.key}>
                    <td className="py-3 px-3 font-bold text-xs text-[#1E2A38]">{time.label}</td>
                    {DAYS_OF_WEEK.map((day) => {
                      const slotKey = `${day.key}-${time.key}`;
                      const isSelected = formData.freeSlots.includes(slotKey);
                      return (
                        <td key={slotKey} className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSlot(slotKey)}
                            className={`w-8 h-8 rounded-lg transition-all inline-flex items-center justify-center text-xs font-bold cursor-pointer ${
                              isSelected
                                ? 'bg-[#1E2A38] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-end gap-3 font-mono">
          {saveError && <span role="alert" className="text-xs text-rose-700">{saveError}</span>}
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#1E2A38] text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer shadow-xs disabled:opacity-60"
          >
            {isSaving ? 'SAVING…' : 'SAVE PROFILE'}
          </button>
        </div>
      </form>
    </div>
  );
};
