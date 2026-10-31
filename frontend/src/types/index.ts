export type NavigationTab = 'profile' | 'roadmap' | 'interviews' | 'progress';

export interface JobDescriptionInput {
  company_name: string;
  job_title: string;
  source_url: string;
  posting_date: string;
  description_text: string;
}

export interface CandidateProfileInput {
  candidate_name: string;
  target_role: string;
  resume_text: string;
  current_role?: string;
  years_experience?: number;
}

export interface SkillAnalysisItem {
  id: string;
  skill_name: string;
  category: string;
  frequency_count: number;
  frequency_total: number;
  frequency_percentage: number;
  job_sources: string[];
  candidate_status: 'demonstrated' | 'partially demonstrated' | 'not evidenced in the resume';
  resume_evidence: string;
  gap_priority: 'high' | 'medium' | 'low';
  importance_rationale: string;
  quick_win: string;
  completed?: boolean;
}

export interface RoadmapTask {
  id: string;
  title: string;
  skill_association: string;
  estimated_hours: number;
  priority: 'Standard' | 'High' | 'Adaptive Priority';
  completed: boolean;
  adaptive_practice?: boolean;
  adaptive_reason?: string;
}

export interface WeeklyObjective {
  week_number: number;
  title: string;
  objective: string;
  focus_skills: string[];
  tasks: RoadmapTask[];
  deliverables: string[];
  learning_resources: Array<{ title: string; type: string; url: string }>;
}

export interface LearningRoadmap {
  title: string;
  estimated_weeks: number;
  weeks: WeeklyObjective[];
  phases?: any[];
}

export interface PortfolioProjectRecommendation {
  id: string;
  title: string;
  connected_skill_gaps: string[];
  difficulty: 'Intermediate' | 'Advanced' | 'Capstone';
  duration: string;
  problem_statement: string;
  architectural_highlights: string[];
  tech_stack: string[];
  verification_criteria: string;
  copyable_resume_bullet: string;
  completed?: boolean;
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  action_type: 'interview' | 'project' | 'roadmap';
  time_estimate: string;
  priority: string;
}

export interface CareerSummary {
  target_role: string;
  overall_skill_coverage_score: number;
  demonstrated_count: number;
  partially_demonstrated_count: number;
  not_evidenced_count: number;
  total_skills_analyzed: number;
  high_priority_gaps_count: number;
  executive_summary: string;
  provider_used: 'gemini' | 'anthropic' | 'demo_fallback';
  is_live_ai: boolean;
  cache_hit: boolean;
  provider_note: string;
}

export interface CareerAnalysisResponse {
  summary: CareerSummary;
  skills_required: SkillAnalysisItem[];
  learning_roadmap: LearningRoadmap;
  portfolio_projects: PortfolioProjectRecommendation[];
}

// Legacy / Helper interfaces
export interface CandidateProfile {
  name: string;
  currentRole: string;
  yearsExperience: number;
  targetRole: string;
  targetIndustry: string;
  currentSkills: string[];
  experienceSummary: string;
  jobDescription: string;
  resumeText?: string;
}

export interface RoadmapMilestone {
  id: string;
  phase: number;
  title: string;
  timeline: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  description: string;
  key_deliverables: string[];
  recommended_resources: Array<{ title: string; type: string; url: string }>;
}

export interface PortfolioProject {
  id: string;
  title: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Capstone';
  duration: string;
  pitch: string;
  architecture: string[];
  tech_stack: string[];
  features: string[];
  resume_bullet: string;
  demo_objective: string;
  completed?: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  context: string;
  expected_key_points: string[];
  time_limit_seconds: number;
}

export interface RubricScore {
  score: number;
  feedback: string;
}

export interface EvaluationResponse {
  overall_score: number;
  verdict: 'Strong Hire' | 'Lean Hire' | 'Needs Refinement';
  star_methodology: RubricScore;
  technical_depth: RubricScore;
  delivery_clarity: RubricScore;
  pivot_confidence: RubricScore;
  strengths: string[];
  areas_for_growth: string[];
  model_answer_snippet: string;
  suggested_followup: string;
}

export interface InterviewHistoryItem {
  id: string;
  timestamp: string;
  questionId: string;
  questionText: string;
  category: string;
  candidateAnswer: string;
  evaluation: EvaluationResponse;
  audioDurationSeconds: number;
}

export type ApplicationStatus = 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected';

export interface ApplicationItem {
  id: string;
  company: string;
  role: string;
  job_family: string;
  date_applied: string;
  source: string;
  status: ApplicationStatus;
  is_synthetic?: boolean;
  location?: string;
  salary_range?: string;
  match_score?: number;
  notes?: string;
  key_requirements_met?: string[];
  missing_requirements?: string[];
  stage?: string;
}

// -------------------------------------------------------------
// Voice-First AI Mock Interview Studio Types
// -------------------------------------------------------------
export type InterviewCategory = 'Python' | 'Generative AI' | 'RAG' | 'Machine Learning' | 'System Design';

export interface StudioQuestionItem {
  id: string;
  category: InterviewCategory;
  role_level: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Applied';
  question: string;
  context: string;
  expected_key_points: string[];
  connected_skill_gap?: string;
  time_limit_seconds: number;
}

export interface DimensionScoreItem {
  score: number;
  feedback: string;
}

export interface StudioDimensionScores {
  structure: DimensionScoreItem;
  technical_depth: DimensionScoreItem;
  relevance: DimensionScoreItem;
  clarity: DimensionScoreItem;
}

export interface StudioImprovementItem {
  suggestion: string;
  connected_skill_gap: string;
  actionable_remedy: string;
}

export interface StudioEvaluationResponse {
  original_answer: string;
  cleaned_structured_answer: string;
  cleaned_unstructured_answer: string;
  dimension_scores: StudioDimensionScores;
  overall_score: number; // out of 20
  percentage: number;
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Refinement';
  strengths: string[];
  improvement_suggestions: StudioImprovementItem[];
  contextual_followups: string[];
  provider_used: 'gemini' | 'anthropic' | 'demo_fallback';
  is_live_ai: boolean;
  evaluation_note: string;
}

export interface StudioHistoryEntry {
  id: string;
  timestamp: string;
  question_id: string;
  question_text: string;
  category: string;
  target_role: string;
  original_answer: string;
  cleaned_structured_answer: string;
  cleaned_unstructured_answer: string;
  overall_score: number;
  verdict: string;
  dimension_scores: StudioDimensionScores;
}
