import React, { useState } from 'react';
import {
  CareerAnalysisResponse,
  SkillAnalysisItem,
  JobDescriptionInput,
  NavigationTab
} from '../types';
import {
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Target,
  Layers,
  Mic,
  FolderGit2,
  FileText,
  Edit3,
  ExternalLink,
  ChevronRight,
  Building,
  Quote,
  Check,
  Copy,
  Cpu,
  Database,
  Search,
  Filter,
  Flame,
  Award
} from 'lucide-react';

interface ProfileSkillGapsViewProps {
  careerAnalysis: CareerAnalysisResponse;
  jobDescriptions: JobDescriptionInput[];
  candidateName: string;
  candidateRole: string;
  onOpenEditorModal: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const ProfileSkillGapsView: React.FC<ProfileSkillGapsViewProps> = ({
  careerAnalysis,
  jobDescriptions,
  candidateName,
  candidateRole,
  onOpenEditorModal,
  onNavigateTab
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);

  const { summary, skills_required, portfolio_projects } = careerAnalysis;

  // Identify the single most critical high-priority skill gap
  const topCriticalGap =
    skills_required.find(
      (s) => s.gap_priority === 'high' && s.candidate_status === 'not evidenced in the resume'
    ) ||
    skills_required.find((s) => s.gap_priority === 'high') ||
    skills_required[0];

  const filteredSkills = skills_required.filter((s) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'High Priority Gaps') return s.gap_priority === 'high';
    if (filterStatus === 'Demonstrated') return s.candidate_status === 'demonstrated';
    if (filterStatus === 'Partially Demonstrated') return s.candidate_status === 'partially demonstrated';
    if (filterStatus === 'Not Evidenced') return s.candidate_status === 'not evidenced in the resume';
    return true;
  });

  const handleCopyBullet = (bullet: string, id: string) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. EXECUTIVE SPOTLIGHT TRIAD (IMMEDIATELY ANSWERS GOAL, TOP GAP, NEXT ACTION) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Candidate Career Goal */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-violet-500/40 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-violet-400" />
                <span>Primary Career Goal</span>
              </span>
              <span className="text-xs font-mono font-bold text-violet-400">{summary.overall_skill_coverage_score}% Match</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {summary.target_role}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pivoting from <strong className="text-slate-200">{candidateRole}</strong> (5 YOE).
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Grounding: 3 Target JDs</span>
            <button
              onClick={onOpenEditorModal}
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
            >
              <span>Edit Setup</span>
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Most Critical Skill Gap */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>#1 Critical Skill Gap</span>
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">High Priority</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
              {topCriticalGap.skill_name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Demand: <strong className="text-amber-300">{topCriticalGap.frequency_count}/{topCriticalGap.frequency_total} Target Roles ({topCriticalGap.frequency_percentage}%)</strong> · Status: <span className="text-rose-300 font-semibold uppercase">{topCriticalGap.candidate_status}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
            <span>Required by: <strong>{topCriticalGap.job_sources.join(', ')}</strong></span>
          </div>
        </div>

        {/* Card 3: Recommended Immediate Next Action */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/70 via-slate-900 to-slate-900 border border-violet-400/50 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Recommended Next Action</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400">~15 mins</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Rehearse Python Microservices & Generators
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Dictate speech directly via Wispr Flow into the AI Mock Interview Studio. Score ≥16/20 to unlock adaptive acceleration.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('interviews')}
            className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-violet-600/30 hover:scale-[1.01] transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-violet-200" />
            <span>Launch Voice Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

      </div>

      {/* 2. ENGINE TRANSPARENCY & TARGET JOB BENCHMARKS STRIP */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Verified Target Job Description Benchmarks (3 Live Industry Postings)
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              summary.is_live_ai
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Cpu className="w-3 h-3" />
              <span>{summary.is_live_ai ? `LIVE AI: ${summary.provider_used.toUpperCase()}` : 'DEMO FALLBACK'}</span>
            </span>
            {summary.cache_hit && (
              <span className="text-[10px] font-mono text-violet-300 bg-violet-950/60 border border-violet-800 px-2 py-0.5 rounded-full">
                Cached SHA-256
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {jobDescriptions.map((jd, idx) => (
            <a
              key={idx}
              href={jd.source_url}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-violet-500/40 transition-colors group block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                  {jd.company_name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {jd.posting_date}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-2">
                {jd.job_title}
              </p>
              <div className="flex items-center space-x-1 text-[10px] font-semibold text-violet-400">
                <span>View verified listing</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 3. GROUNDED SKILL GAP EVIDENCE MATRIX */}
      <div className="space-y-4">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Grounded Skill Gap Analysis & Resume Citations
            </h2>
            <p className="text-xs text-slate-400">
              Cross-referenced against all 3 job descriptions with verbatim resume quote citations
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs">
            {['All', 'High Priority Gaps', 'Demonstrated', 'Partially Demonstrated', 'Not Evidenced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterStatus === tab
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => {
            const isDemonstrated = skill.candidate_status === 'demonstrated';
            const isPartial = skill.candidate_status === 'partially demonstrated';
            const isNotEvidenced = skill.candidate_status === 'not evidenced in the resume';

            return (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all duration-200 shadow-xl space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {skill.category}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        skill.gap_priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : skill.gap_priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {skill.gap_priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {skill.frequency_count}/{skill.frequency_total} JDs ({skill.frequency_percentage}%)
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {skill.skill_name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {skill.importance_rationale}
                  </p>
                </div>

                {/* Candidate Status & Resume Evidence Quote */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Candidate Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isDemonstrated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isPartial
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {skill.candidate_status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500 font-semibold text-[10px]">
                      <Quote className="w-3 h-3 text-violet-400" />
                      <span>Resume Evidence Citations:</span>
                    </div>
                    <p className="italic text-slate-300 line-clamp-2">
                      "{skill.resume_evidence}"
                    </p>
                  </div>
                </div>

                {/* Quick Win Action */}
                <div className="p-2.5 rounded-xl bg-violet-950/20 border border-violet-500/20 text-[11px] text-slate-300 flex items-start space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-violet-300 mr-1">Quick Win:</span>
                    <span>{skill.quick_win}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. THREE CONNECTED PORTFOLIO PROJECTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-violet-400" />
              Three Gap-Connected Portfolio Projects
            </h2>
            <p className="text-xs text-slate-400">
              Verifiable GitHub repository architectures designed to close identified skill gaps
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View 6-Week Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {portfolio_projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all duration-200 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    proj.difficulty === 'Capstone'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : proj.difficulty === 'Advanced'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {proj.difficulty} · {proj.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {proj.problem_statement}
                </p>

                {/* Connected Skill Gaps */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Directly Proves Skill Gaps:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {proj.connected_skill_gaps.map((gap, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                      >
                        ✓ {gap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.tech_stack.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copyable Resume Bullet */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Resume Impact Bullet:
                  </span>
                  <button
                    onClick={() => handleCopyBullet(proj.copyable_resume_bullet, proj.id)}
                    className="text-[10px] font-semibold text-violet-400 hover:text-violet-200 flex items-center space-x-1"
                  >
                    {copiedBulletId === proj.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 italic font-sans leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  "{proj.copyable_resume_bullet}"
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
