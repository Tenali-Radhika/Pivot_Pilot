import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  CandidateProfileInput,
  JobDescriptionInput,
  CareerAnalysisResponse,
  RoadmapMilestone,
  PortfolioProject,
  ApplicationItem,
  SuggestedAction
} from './types';
import { storageService, DEMO_RESUME, DEMO_JDS } from './services/storage';
import { apiService } from './services/api';
import { adaptivePlanner } from './services/adaptivePlanner';
import { Navbar } from './components/Navbar';
import { ProfileSkillGapsView } from './views/ProfileSkillGapsView';
import { RoadmapProjectsView } from './views/RoadmapProjectsView';
import { MockInterviewsView } from './views/MockInterviewsView';
import { ProgressApplicationsView } from './views/ProgressApplicationsView';
import { ResumeJdEditorModal } from './components/ResumeJdEditorModal';
import { NewProjectModal } from './components/NewProjectModal';
import { PitchModal } from './components/PitchModal';
import { Sparkles, Mic, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('profile');
  const [apiStatus, setApiStatus] = useState<string>('checking');

  // Candidate Profile & Target Role
  const [candidateName, setCandidateName] = useState<string>("Alex Chen");
  const [candidateRole, setCandidateRole] = useState<string>("Senior Software / Frontend Engineer");
  const [targetRole, setTargetRole] = useState<string>(() => storageService.getTargetRole());
  const [resumeText, setResumeText] = useState<string>(() => storageService.getResumeText());
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionInput[]>(() => storageService.getJobDescriptions());

  // Deep Career Analysis State
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysisResponse | null>(() => storageService.getCareerAnalysis());
  
  // Roadmap & Projects & Applications
  const [phases, setPhases] = useState<RoadmapMilestone[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>(() => storageService.getApplications() || []);

  // Modal States
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pitch Modal State
  const [selectedAppForPitch, setSelectedAppForPitch] = useState<ApplicationItem | null>(null);
  const [pitchData, setPitchData] = useState<{ elevator_pitch: string; key_selling_points: string[]; cover_note_hook: string } | null>(null);
  const [isPitchLoading, setIsPitchLoading] = useState(false);

  // Sync Roadmap and Portfolio Projects from Career Analysis
  const syncRoadmapAndProjects = (analysis: CareerAnalysisResponse) => {
    const weeks = analysis.learning_roadmap.weeks || [];
    const mappedPhases: RoadmapMilestone[] = weeks.map((w) => ({
      id: `week-${w.week_number}`,
      phase: w.week_number,
      title: w.title,
      timeline: `Week ${w.week_number}`,
      status: w.week_number === 1 ? 'completed' : w.week_number === 2 ? 'in-progress' : 'upcoming',
      description: w.objective,
      key_deliverables: w.deliverables,
      recommended_resources: w.learning_resources
    }));
    setPhases(mappedPhases);

    // Map 3 portfolio projects directly connecting to gaps
    const mappedProjects: PortfolioProject[] = (analysis.portfolio_projects || []).map((rec) => ({
      id: rec.id,
      title: rec.title,
      difficulty: rec.difficulty,
      duration: rec.duration,
      pitch: rec.problem_statement,
      architecture: rec.architectural_highlights,
      tech_stack: rec.tech_stack,
      features: [
        `Proves: ${rec.connected_skill_gaps.join(' · ')}`,
        `Verification: ${rec.verification_criteria}`
      ],
      resume_bullet: rec.copyable_resume_bullet,
      demo_objective: rec.verification_criteria,
      completed: rec.completed || false
    }));
    setProjects(mappedProjects);
  };

  // Initial Data Bootstrap
  useEffect(() => {
    async function bootstrap() {
      const health = await apiService.checkHealth();
      setApiStatus(health.status);

      // Check if analysis exists in local storage
      const cached = storageService.getCareerAnalysis();
      if (cached) {
        setCareerAnalysis(cached);
        syncRoadmapAndProjects(cached);
      } else {
        // Run first career intelligence analysis
        await handleRunAnalysis({
          candidate_name: candidateName,
          target_role: targetRole,
          resume_text: resumeText,
          current_role: candidateRole,
          years_experience: 5
        }, jobDescriptions);
      }

      // Load applications
      if (applications.length === 0) {
        const appPresets = await apiService.getPresetApplications();
        setApplications(appPresets);
        storageService.saveApplications(appPresets);
      }
    }

    bootstrap();
  }, []);

  // Main Analysis Execution
  const handleRunAnalysis = async (
    candidateInput: CandidateProfileInput,
    jdsInput: JobDescriptionInput[]
  ) => {
    setIsAnalyzing(true);
    try {
      setCandidateName(candidateInput.candidate_name);
      setTargetRole(candidateInput.target_role);
      setResumeText(candidateInput.resume_text);
      setJobDescriptions(jdsInput);

      storageService.saveTargetRole(candidateInput.target_role);
      storageService.saveResumeText(candidateInput.resume_text);
      storageService.saveJobDescriptions(jdsInput);

      const result = await apiService.analyzeCareer(candidateInput, jdsInput);
      setCareerAnalysis(result);
      storageService.saveCareerAnalysis(result);
      syncRoadmapAndProjects(result);

      setIsEditorModalOpen(false);
    } catch (err: any) {
      console.error('Career analysis error:', err);
      alert(`Analysis failed: ${err.message || 'Please check backend server'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdatePhases = (updatedPhases: RoadmapMilestone[]) => {
    setPhases(updatedPhases);
  };

  const handleUpdateProjects = (updatedProjects: PortfolioProject[]) => {
    setProjects(updatedProjects);
  };

  const handleAddProject = (newProj: PortfolioProject) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
  };

  const handleUpdateApplications = (updatedApps: ApplicationItem[]) => {
    setApplications(updatedApps);
    storageService.saveApplications(updatedApps);
  };

  const handleOpenPitchModal = async (app: ApplicationItem) => {
    setSelectedAppForPitch(app);
    setIsPitchLoading(true);
    try {
      const data = await apiService.tailorPitch(app.company, app.role);
      setPitchData(data);
    } catch {
      setPitchData({
        elevator_pitch: `With over 5 years architecting high-performance client applications, I bring a unique dual advantage to ${app.company}: I don't just build autonomous agent workflows in Python and LangGraph—I deliver them into responsive, deterministic user experiences that users actually trust.`,
        key_selling_points: [
          `Bridges Gen AI backend systems and customer experience for ${app.company}.`,
          'Demonstrated portfolio code with state machines, hybrid retrieval, and automated Ragas evaluation.',
          'Proven record of shipping production features with sub-second feedback.'
        ],
        cover_note_hook: `I was inspired by ${app.company}'s work in generative AI. Having transitioned from full-stack architecture to agentic engineering, I understand firsthand how to turn non-deterministic LLMs into reliable enterprise products.`
      });
    } finally {
      setIsPitchLoading(false);
    }
  };

  const studioHistory = storageService.getStudioHistory();
  const completedTasks = storageService.getCompletedTasks();
  const adaptivePlan = careerAnalysis?.learning_roadmap.weeks
    ? adaptivePlanner.replanRoadmap(careerAnalysis.learning_roadmap.weeks, studioHistory, completedTasks)
    : null;
  const overallReadiness = adaptivePlan?.adaptiveReadinessScore || careerAnalysis?.summary.overall_skill_coverage_score || 68;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        targetRole={targetRole}
        candidateName={candidateName}
        overallReadiness={overallReadiness}
        apiStatus={apiStatus}
        onOpenProfileModal={() => setIsEditorModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Tab Views */}
        {currentTab === 'profile' && careerAnalysis && (
          <ProfileSkillGapsView
            careerAnalysis={careerAnalysis}
            jobDescriptions={jobDescriptions}
            candidateName={candidateName}
            candidateRole={candidateRole}
            onOpenEditorModal={() => setIsEditorModalOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'roadmap' && (
          <RoadmapProjectsView
            baselineWeeks={careerAnalysis?.learning_roadmap.weeks || []}
            portfolioProjects={careerAnalysis?.portfolio_projects || []}
            targetRole={targetRole}
            interviewHistory={storageService.getStudioHistory()}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'interviews' && (
          <MockInterviewsView targetRole={targetRole} onNavigateTab={setCurrentTab} />
        )}

        {currentTab === 'progress' && (
          <ProgressApplicationsView
            applications={applications}
            onUpdateApplications={handleUpdateApplications}
            onSelectApplicationForPitch={handleOpenPitchModal}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-navy-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-violet-400" />
            <span className="font-bold text-slate-300">Pivot Pilot</span>
            <span>—</span>
            <span>Turn career ambition into measurable progress.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Agentic AI Hackathon 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Target: Gen AI Engineer</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Voice-First AI Architecture</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ResumeJdEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        candidateName={candidateName}
        targetRole={targetRole}
        resumeText={resumeText}
        jobDescriptions={jobDescriptions}
        onSaveAndAnalyze={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />

      <PitchModal
        isOpen={Boolean(selectedAppForPitch)}
        onClose={() => setSelectedAppForPitch(null)}
        application={selectedAppForPitch}
        pitchData={pitchData}
        isLoading={isPitchLoading}
      />

    </div>
  );
};
