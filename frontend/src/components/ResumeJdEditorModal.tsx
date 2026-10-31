import React, { useState } from 'react';
import { CandidateProfileInput, JobDescriptionInput } from '../types';
import { DEMO_RESUME, DEMO_JDS } from '../services/storage';
import {
  X,
  FileText,
  Briefcase,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Calendar,
  Building,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResumeJdEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  targetRole: string;
  resumeText: string;
  jobDescriptions: JobDescriptionInput[];
  onSaveAndAnalyze: (
    candidate: CandidateProfileInput,
    jds: JobDescriptionInput[]
  ) => void;
  isAnalyzing: boolean;
}

export const ResumeJdEditorModal: React.FC<ResumeJdEditorModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  targetRole,
  resumeText,
  jobDescriptions,
  onSaveAndAnalyze,
  isAnalyzing
}) => {
  const [candidateState, setCandidateState] = useState<CandidateProfileInput>({
    candidate_name: candidateName,
    target_role: targetRole || "Gen AI Engineer",
    resume_text: resumeText,
    current_role: "Senior Software / Frontend Systems Engineer",
    years_experience: 5
  });

  const [jdsState, setJdsState] = useState<JobDescriptionInput[]>(() => {
    if (jobDescriptions && jobDescriptions.length === 3) return jobDescriptions;
    return DEMO_JDS;
  });

  const [activeTab, setActiveTab] = useState<'resume' | 0 | 1 | 2>('resume');

  if (!isOpen) return null;

  const handleJdChange = (index: number, field: keyof JobDescriptionInput, value: string) => {
    const updated = [...jdsState];
    updated[index] = { ...updated[index], [field]: value };
    setJdsState(updated);
  };

  const handleResetToDemo = () => {
    setCandidateState({
      candidate_name: "Alex Chen",
      target_role: "Gen AI Engineer",
      resume_text: DEMO_RESUME,
      current_role: "Senior Software / Frontend Systems Engineer",
      years_experience: 5
    });
    setJdsState(DEMO_JDS);
  };

  const wordCount = candidateState.resume_text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateState.resume_text.trim()) {
      alert("Please paste or enter candidate resume text.");
      return;
    }
    onSaveAndAnalyze(candidateState, jdsState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-violet-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 border border-violet-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Career Pivot Intelligence Setup</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Target: Gen AI Engineer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Analyze candidate resume text against 3 real job descriptions with grounded evidence citations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
              title="Reset to 3 verified real-world Gen AI Engineer job descriptions and candidate resume"
            >
              <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
              <span>Load 3 Real JDs Preset</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Resume vs Job 1 vs Job 2 vs Job 3 */}
        <div className="flex items-center space-x-1.5 py-3 border-b border-slate-800 flex-shrink-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'resume'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Candidate Resume ({wordCount} words)</span>
          </button>

          {[0, 1, 2].map((idx) => {
            const jd = jdsState[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx as 0 | 1 | 2)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === idx
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job {idx + 1}: {jd.company_name || `Company ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          
          {/* TAB 1: RESUME & TARGET ROLE */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={candidateState.candidate_name}
                    onChange={(e) => setCandidateState({ ...candidateState, candidate_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Pivot Role 🎯</label>
                  <input
                    type="text"
                    value={candidateState.target_role}
                    onChange={(e) => setCandidateState({ ...candidateState, target_role: e.target.value })}
                    className="w-full bg-slate-950 border border-violet-500/50 rounded-xl px-3 py-2 text-violet-200 font-bold focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Background</label>
                  <input
                    type="text"
                    value={candidateState.current_role}
                    onChange={(e) => setCandidateState({ ...candidateState, current_role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300">
                    Candidate Resume Text (Raw Experience, Skills, Project Bullet Points):
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {wordCount} words detected
                  </span>
                </div>
                <textarea
                  rows={12}
                  required
                  value={candidateState.resume_text}
                  onChange={(e) => setCandidateState({ ...candidateState, resume_text: e.target.value })}
                  placeholder="Paste candidate's full resume text here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-violet-500 resize-y"
                />
              </div>

              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-slate-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Strict Evidence Rule:</strong> Pivot Pilot will extract concrete quotes from this text to support demonstrated skills. Skills not mentioned will be marked strictly as <em>"not evidenced in the resume"</em> without fabricating credentials.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4: THREE REAL JOB DESCRIPTIONS */}
          {typeof activeTab === 'number' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-violet-300 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  Real Job Description #{activeTab + 1}
                </span>
                <span className="text-[11px] text-slate-400">
                  Provide verified job listing metadata
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={jdsState[activeTab].company_name}
                    onChange={(e) => handleJdChange(activeTab, 'company_name', e.target.value)}
                    placeholder="e.g. Anthropic / Cohere / Databricks"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jdsState[activeTab].job_title}
                    onChange={(e) => handleJdChange(activeTab, 'job_title', e.target.value)}
                    placeholder="e.g. Generative AI Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Original Source URL</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={jdsState[activeTab].source_url}
                    onChange={(e) => handleJdChange(activeTab, 'source_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Posting Date</span>
                  </label>
                  <input
                    type="text"
                    value={jdsState[activeTab].posting_date}
                    onChange={(e) => handleJdChange(activeTab, 'posting_date', e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Full Job Description Text (Requirements, Responsibilities, Tech Stack):
                </label>
                <textarea
                  rows={8}
                  required
                  value={jdsState[activeTab].description_text}
                  onChange={(e) => handleJdChange(activeTab, 'description_text', e.target.value)}
                  placeholder="Paste the full job posting requirements and qualifications here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-violet-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Results will be validated by Pydantic and cached for instant subsequent demos.</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white flex items-center space-x-2 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing 3 JDs vs Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    <span>Run Career Gap Intelligence</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

