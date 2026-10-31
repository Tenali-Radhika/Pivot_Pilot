import React, { useState } from 'react';
import { CandidateProfile } from '../types';
import { X, Save, Sparkles, RefreshCw, Briefcase, Target, BookOpen } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onSave: (updated: CandidateProfile) => void;
  isAnalyzing: boolean;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isAnalyzing
}) => {
  const [formData, setFormData] = useState<CandidateProfile>({ ...profile });
  const [skillInput, setSkillInput] = useState('');

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.currentSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        currentSkills: [...formData.currentSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      currentSkills: formData.currentSkills.filter((s) => s !== skill)
    });
  };

  const handleApplyPreset = (targetRole: string, sampleJd: string) => {
    setFormData({
      ...formData,
      targetRole,
      jobDescription: sampleJd
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-violet-500/30 rounded-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Candidate Transition Profile</h2>
              <p className="text-xs text-slate-400">Configure your current background and target role requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Transition Presets */}
        <div className="my-4 p-3 rounded-xl bg-violet-950/30 border border-violet-500/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 block mb-2">
            ⚡ Quick Transition Presets (1-Click Test):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset(
                "AI Solutions & Agentic Engineer",
                "Requirements: Experience with LangChain/LangGraph or custom LLM orchestration, vector databases (Pinecone/Chroma/Qdrant), RAG architecture design, prompt engineering & evaluation frameworks (TruLens/Ragas), and Python/FastAPI microservices."
              )}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-violet-900/40 text-slate-200 border border-slate-700 hover:border-violet-500/50 transition-all"
            >
              Frontend → AI Agent Engineer
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(
                "AI Product Manager (LLM Platforms)",
                "Seeking an AI Product Manager to define multi-agent enterprise workflows. Must understand prompt evaluation benchmarks, cost-per-token economics, latency tradeoffs, and model safety guardrails."
              )}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-violet-900/40 text-slate-200 border border-slate-700 hover:border-violet-500/50 transition-all"
            >
              Traditional PM → AI/LLM Product Manager
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(
                "Machine Learning / RAG Engineer",
                "Requirements: Deep expertise in semantic embedding retrieval, fine-tuning embedding models, hybrid search (BM25 + Dense), document ingestion chunking strategies, and FastAPI."
              )}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-violet-900/40 text-slate-200 border border-slate-700 hover:border-violet-500/50 transition-all"
            >
              Data Analyst → ML / RAG Engineer
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Candidate Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Current Job Title</label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Pivot Role 🎯</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full bg-slate-950 border border-violet-500/40 rounded-lg px-3 py-2 text-violet-200 font-semibold focus:outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Years of Relevant Experience</label>
              <input
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Current Skills list & adder */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Current Technical Competencies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. Python, Docker, PyTorch) and press Enter"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              {formData.currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Summary */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Experience & Transition Summary</label>
            <textarea
              rows={3}
              value={formData.experienceSummary}
              onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Target Job Description to Analyze Against */}
          <div>
            <label className="block font-semibold text-violet-300 mb-1 flex items-center justify-between">
              <span>Target Role Job Description (AI extracts skill gaps against this):</span>
              <span className="text-[10px] text-slate-400">Paste any real LinkedIn / Greenhouse JD</span>
            </label>
            <textarea
              rows={4}
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full bg-slate-950 border border-violet-500/30 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Re-analyzing Career Fit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save & Analyze Gaps</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

