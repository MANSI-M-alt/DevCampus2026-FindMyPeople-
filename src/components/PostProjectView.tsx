import React, { useState } from 'react';
import { Project, Goal } from '../types';
import { Plus, X, Rocket, Users, FileText, CheckCircle, Sparkles } from 'lucide-react';

interface PostProjectViewProps {
  currentUserId: string;
  onProjectPosted: (newProject: Project) => void;
  onTriggerMatch: () => void;
}

export const PostProjectView: React.FC<PostProjectViewProps> = ({
  currentUserId,
  onProjectPosted,
  onTriggerMatch,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const [goal, setGoal] = useState<Goal>('start a startup');
  const [postedSuccess, setPostedSuccess] = useState(false);

  const goalOptions: { value: Goal; label: string; desc: string }[] = [
    { value: 'start a startup', label: 'Start a Startup', desc: 'Build a scalable commercial venture' },
    { value: 'win a hackathon', label: 'Win a Hackathon', desc: 'Fast-paced intensive weekend build' },
    { value: 'build a portfolio', label: 'Build a Portfolio', desc: 'Polished product for resume & showcase' },
    { value: 'learn something new', label: 'Learn Something New', desc: 'Cross-functional skills exploration' },
    { value: 'research or publish', label: 'Research or Publish', desc: 'Academic paper, dataset or technical study' },
  ];

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    if (!rolesNeeded.includes(newRole.trim())) {
      setRolesNeeded([...rolesNeeded, newRole.trim()]);
    }
    setNewRole('');
  };

  const handleRemoveRole = (role: string) => {
    setRolesNeeded(rolesNeeded.filter((r) => r !== role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const project: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      rolesNeeded: rolesNeeded.length > 0 ? rolesNeeded : ['Collaborator'],
      goal,
      authorId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    onProjectPosted(project);
    setPostedSuccess(true);
  };

  const handleQuickLoadSample = () => {
    setTitle('AI-Powered Health Tracker for Rural Clinics');
    setDescription(
      'Building a lightweight, offline-first mobile diagnostic & patient tracking application tailored for health workers in low-bandwidth rural clinics. Features predictive risk flagging, high-accessibility UI for non-tech users, and a sustainable impact model.'
    );
    setRolesNeeded([
      'Biotech / Clinical Subject Expert',
      'UI/UX Accessibility Designer',
      'Full-Stack / Mobile Developer',
    ]);
    setGoal('start a startup');
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Sample Quick Loader Box */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 font-mono">
          <div className="text-[10px] text-slate-400 font-bold uppercase">AUTO-FILL DEMO SAMPLE</div>
          <div className="text-xs font-bold text-[#1E2A38]">AI Health Tracker for Rural Clinics</div>
        </div>
        <button
          type="button"
          onClick={handleQuickLoadSample}
          className="px-4 py-2 rounded-xl bg-[#1E2A38] text-white font-mono text-xs font-bold transition hover:bg-slate-800 shrink-0 cursor-pointer shadow-xs"
        >
          Auto-fill Sample Project
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="text-base font-bold text-[#1E2A38] border-b border-dashed border-slate-200 pb-3 font-mono uppercase">
          POST NEW PROJECT IDEA
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1">
            Project Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI-Powered Health Tracker for Rural Clinics"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#1E2A38] focus:ring-2 focus:ring-[#1E2A38] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1">
            One-Paragraph Description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the problem you're solving, who it is for, and why interdisciplinary collaboration is key..."
            className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-[#334155] focus:ring-2 focus:ring-[#1E2A38] focus:outline-none"
          />
        </div>

        {/* Roles Needed */}
        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase font-bold text-slate-400">
            Roles / Complementary Skills Needed
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {rolesNeeded.map((role) => (
              <span key={role} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-[#1E2A38]">
                {role}
                <button type="button" onClick={() => handleRemoveRole(role)} className="p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Clinical Specialist, UI Designer, Hardware Engineer"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold"
            />
            <button
              type="button"
              onClick={handleAddRole}
              className="px-4 py-2 rounded-xl bg-[#1E2A38] text-white font-bold"
            >
              Add Role
            </button>
          </div>
        </div>

        {/* Project Goal */}
        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase font-bold text-slate-400">
            Project Goal
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {goalOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setGoal(opt.value)}
                className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer ${
                  goal === opt.value
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

        {/* Submit */}
        <div className="pt-3 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {postedSuccess ? (
            <div className="flex items-center gap-3 text-emerald-900 bg-emerald-50 border border-emerald-200 p-3 rounded-xl w-full justify-between font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" /> Project Published Successfully
              </span>
              <button
                type="button"
                onClick={onTriggerMatch}
                className="px-4 py-1.5 rounded-lg bg-[#1E2A38] text-white font-bold cursor-pointer"
              >
                View Matches
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl bg-[#1E2A38] text-white font-mono text-xs font-bold transition hover:bg-slate-800 cursor-pointer shadow-xs"
            >
              PUBLISH PROJECT & MATCH
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
