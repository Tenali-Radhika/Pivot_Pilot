import React, { useState, useEffect } from 'react';
import {
  WeeklyObjective,
  RoadmapTask,
  PortfolioProjectRecommendation,
  StudioHistoryEntry,
  NavigationTab
} from '../types';
import { adaptivePlanner, AdaptivePlanResult } from '../services/adaptivePlanner';
import { storageService } from '../services/storage';
import {
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Plus,
  BookOpen,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Award,
  Target,
  RefreshCw,
  Cpu,
  History
} from 'lucide-react';

interface RoadmapProjectsViewProps {
  baselineWeeks: WeeklyObjective[];
  portfolioProjects: PortfolioProjectRecommendation[];
  targetRole: string;
  interviewHistory: StudioHistoryEntry[];
  onNavigateTab: (tab: NavigationTab) => void;
}

export const RoadmapProjectsView: React.FC<RoadmapProjectsViewProps> = ({
  baselineWeeks,
  portfolioProjects,
  targetRole,
  interviewHistory,
  onNavigateTab
}) => {
  // Task completion state persisted in localStorage
  const [taskCompletionMap, setTaskCompletionMap] = useState<Record<string, boolean>>(() =>
    storageService.getCompletedTasks()
  );

  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'projects'>('roadmap');

  // Compute deterministic adaptive replanning
  const planResult: AdaptivePlanResult = adaptivePlanner.replanRoadmap(
    baselineWeeks,
    interviewHistory,
    taskCompletionMap
  );

  // Toggle task completed
  const handleToggleTask = (taskId: string) => {
    const updated = {
      ...taskCompletionMap,
      [taskId]: !taskCompletionMap[taskId]
    };
    setTaskCompletionMap(updated);
    storageService.saveCompletedTasks(updated);
  };

  const handleCopyBullet = (bullet: string, id: string) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. HERO BANNER: 6-WEEK ADAPTIVE INTELLIGENCE */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-navy-950 border border-violet-500/40 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/25 text-violet-300 border border-violet-500/40 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                <span>6-Week Curriculum & Progress Intelligence</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Cpu className="w-3 h-3" />
                <span>Deterministic Adaptive Replanning (No LLM Calls)</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Personalized 6-Week Transition Roadmap
            </h1>

            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Targeting <strong className="text-violet-300">{targetRole}</strong>. Weekly objectives and specific tasks
              adapt in real-time based on your mock interview scores—prioritizing technical depth drills while strictly preserving
              your original roadmap history and task progress.
            </p>
          </div>

          {/* Progress & Adaptive Momentum Gauge */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/80 border border-violet-500/30">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tasks Done</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {planResult.completedCount}/{planResult.totalTaskCount}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">({planResult.completionPercentage}%)</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Adaptive Readiness</span>
              <span className="text-2xl font-bold font-mono text-violet-300">
                {planResult.adaptiveReadinessScore}%
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">Active Momentum</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADAPTIVE REMEDIATION & PERFORMANCE ALERTS */}
      {planResult.activeRemediationAlerts.length > 0 && (
        <div className="space-y-2.5">
          {planResult.activeRemediationAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start space-x-3.5 transition-all ${
                alert.severity === 'high'
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : alert.severity === 'improved'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}
            >
              {alert.severity === 'high' ? (
                <Flame className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0 animate-pulse" />
              ) : alert.severity === 'improved' ? (
                <Award className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              )}

              <div className="flex-1 text-xs">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/30 border border-white/10">
                    {alert.severity === 'improved' ? '✨ Skill Reinforced' : '⚡ Adaptive Priority Alert'}
                  </span>
                  <span className="font-bold text-white">{alert.category} Domain</span>
                </div>
                <p className="font-semibold text-slate-200">{alert.reason}</p>
                <p className="text-slate-400 mt-1">{alert.action}</p>
              </div>

              <button
                onClick={() => onNavigateTab('interviews')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 whitespace-nowrap self-center"
              >
                Rehearse in Studio
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. ROADMAP / PORTFOLIO SUB-NAV */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>6-Week Curriculum ({planResult.weeks.length} Weeks · {planResult.totalTaskCount} Tasks)</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>3 Gap-Connected Portfolio Projects</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          {planResult.completedCount} completed · {planResult.totalTaskCount - planResult.completedCount} remaining
        </div>
      </div>

      {/* 4. TAB CONTENT: 6-WEEK ROADMAP ACCORDION */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          {planResult.weeks.map((week) => {
            const isExpanded = expandedWeek === week.week_number;
            const weekTasks = week.tasks;
            const weekCompleted = weekTasks.filter((t) => t.completed).length;
            const weekPct = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;
            const hasAdaptivePriority = weekTasks.some((t) => t.priority === 'Adaptive Priority');

            return (
              <div
                key={week.week_number}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  hasAdaptivePriority
                    ? 'bg-slate-900 border-violet-500/50 shadow-lg shadow-violet-500/10'
                    : weekCompleted === weekTasks.length && weekTasks.length > 0
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Week Header */}
                <div
                  onClick={() => setExpandedWeek(isExpanded ? 0 : week.week_number)}
                  className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all ${
                        weekCompleted === weekTasks.length && weekTasks.length > 0
                          ? 'bg-emerald-500 text-navy-950 font-bold'
                          : hasAdaptivePriority
                          ? 'bg-violet-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {weekCompleted === weekTasks.length && weekTasks.length > 0 ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <span>W{week.week_number}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-violet-400">
                          Week {week.week_number}
                        </span>
                        {hasAdaptivePriority && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            <Flame className="w-3 h-3 text-violet-400" />
                            <span>Adaptive Priority Injected</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {weekCompleted}/{weekTasks.length} Done ({weekPct}%)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {week.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${weekPct}%` }}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Week Content */}
                {isExpanded && (
                  <div className="px-5 md:px-6 pb-6 pt-1 border-t border-slate-800/80 space-y-5">
                    
                    {/* Weekly Learning Objective */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="font-bold text-violet-300 block mb-1 uppercase tracking-wider text-[10px]">
                        Weekly Learning Objective:
                      </span>
                      <p className="text-slate-200 leading-relaxed font-sans font-medium">
                        {week.objective}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">Focus Skills:</span>
                        {week.focus_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specific Tasks Checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                          Specific Actionable Tasks ({weekTasks.length}):
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Click checkbox to update progress immediately
                        </span>
                      </div>

                      <div className="space-y-2">
                        {weekTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(task.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 group ${
                              task.completed
                                ? 'bg-emerald-950/15 border-emerald-500/30 opacity-75'
                                : task.priority === 'Adaptive Priority'
                                ? 'bg-violet-950/20 border-violet-500/40 hover:border-violet-400'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTask(task.id);
                              }}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 flex-shrink-0 transition-all ${
                                task.completed
                                  ? 'bg-emerald-500 border-emerald-400 text-navy-950 font-bold'
                                  : 'border-slate-600 bg-slate-900 hover:border-violet-400'
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="flex-1 text-xs space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className={`font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-white'}`}>
                                  {task.title}
                                </span>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    task.priority === 'Adaptive Priority'
                                      ? 'bg-violet-500/30 text-violet-200 border border-violet-400/50'
                                      : task.priority === 'High'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ~{task.estimated_hours}h
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                                <Target className="w-3 h-3 text-violet-400" />
                                <span>Skill Association: <strong className="text-slate-300">{task.skill_association}</strong></span>
                              </div>

                              {task.adaptive_reason && (
                                <div className="mt-1.5 text-[11px] text-amber-200 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-start space-x-2">
                                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                                  <div>
                                    <span className="font-bold text-amber-300">Interview Adaptive Remedy: </span>
                                    <span>{task.adaptive_reason}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverable & Resources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Week {week.week_number} Deliverables:
                        </span>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {week.deliverables.map((del, dIdx) => (
                            <li key={dIdx} className="flex items-start space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Recommended Resources:
                        </span>
                        <div className="space-y-1.5">
                          {week.learning_resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between text-[11px] text-slate-300 hover:text-white group p-1 rounded hover:bg-slate-900 transition-colors"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <BookOpen className="w-3 h-3 text-violet-400" />
                                <span className="group-hover:underline">{res.title}</span>
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-violet-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. TAB CONTENT: 3 PORTFOLIO PROJECTS DIRECTLY CONNECTING TO GAPS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-violet-400" />
              Three Portfolio Projects Directly Connecting to Identified Gaps
            </h2>
            <p className="text-xs text-slate-400">
              Generated by the career intelligence engine to give hiring managers concrete, verifiable proof of competency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {portfolioProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-3xl bg-slate-900 border border-violet-500/30 hover:border-violet-500/50 shadow-xl flex flex-col justify-between space-y-4 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      proj.difficulty === 'Capstone'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : proj.difficulty === 'Advanced'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    }`}>
                      {proj.difficulty} · {proj.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {proj.problem_statement}
                  </p>

                  {/* Connected Gaps Badges */}
                  <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/20 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-violet-300 tracking-wider block">
                      Directly Proves Identified Gaps:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {proj.connected_skill_gaps.map((gap, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-violet-900/50 text-violet-200 border border-violet-700/60 font-medium"
                        >
                          ✓ {gap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {proj.tech_stack.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architectural Blueprint */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <strong className="text-slate-200 block text-xs">Architectural Blueprint:</strong>
                    {proj.architectural_highlights.map((arch, i) => (
                      <div key={i} className="flex items-start space-x-1.5">
                        <span className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                        <span>{arch}</span>
                      </div>
                    ))}
                  </div>

                  {/* Verification Criteria */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-emerald-400 block mb-0.5 text-xs">Live Hiring Manager Verification:</strong>
                    <span>{proj.verification_criteria}</span>
                  </div>
                </div>

                {/* Copyable Resume Impact Bullet */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Copyable Resume Impact Bullet:
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
                  <p className="text-[11px] text-slate-300 italic font-sans leading-relaxed bg-navy-950 p-2.5 rounded-xl border border-slate-800/80">
                    "{proj.copyable_resume_bullet}"
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
