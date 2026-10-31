import React, { useState } from 'react';
import { X, Plus, Sparkles, FolderGit2 } from 'lucide-react';
import { PortfolioProject } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: PortfolioProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject
}) => {
  const [title, setTitle] = useState('');
  const [pitch, setPitch] = useState('');
  const [difficulty, setDifficulty] = useState<'Intermediate' | 'Advanced' | 'Capstone'>('Advanced');
  const [techStackInput, setTechStackInput] = useState('Python, FastAPI, LangGraph, Qdrant, Docker');
  const [resumeBullet, setResumeBullet] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pitch.trim()) return;

    const newProj: PortfolioProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      difficulty,
      duration: difficulty === 'Capstone' ? '3 Weeks' : '1.5 Weeks',
      pitch: pitch.trim(),
      architecture: [
        'API Gateway & Orchestration Layer',
        'State Graph Memory & Tool Calling Registry',
        'Vector Embedding & Retrieval Pipeline'
      ],
      tech_stack: techStackInput.split(',').map((s) => s.trim()).filter(Boolean),
      features: [
        'Deterministic tool execution guarantees',
        'Automated CI/CD evaluation test suite',
        'Live interactive client demo'
      ],
      resume_bullet: resumeBullet.trim() || `Architected ${title} utilizing ${techStackInput}, establishing end-to-end autonomous agent workflow and achieving 92% reliability benchmarks.`,
      demo_objective: 'Present live system architecture and execute synthetic test evaluation suite.',
      completed: false
    };

    onAddProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-violet-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Custom Portfolio Project</h3>
              <p className="text-xs text-slate-400">Add a high-signal project tailored to your target role</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Multi-Agent Customer Support Escalator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Capstone">Capstone</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tech Stack (comma separated)</label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Pitch & Problem Statement</label>
            <textarea
              rows={2}
              required
              placeholder="What problem does this project solve? How does it demonstrate agentic intelligence?"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Resume Bullet Point (Impact)</label>
            <input
              type="text"
              placeholder="Engineered an autonomous agent utilizing..., improving..."
              value={resumeBullet}
              onChange={(e) => setResumeBullet(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1.5 shadow-md shadow-violet-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Portfolio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

