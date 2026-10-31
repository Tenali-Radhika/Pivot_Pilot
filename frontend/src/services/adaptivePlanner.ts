import {
  WeeklyObjective,
  RoadmapTask,
  StudioHistoryEntry,
  PortfolioProjectRecommendation
} from '../types';

export interface AdaptivePlanResult {
  weeks: WeeklyObjective[];
  completedCount: number;
  totalTaskCount: number;
  completionPercentage: number;
  adaptiveDrillCount: number;
  repeatedWeaknessCount: number;
  improvedCount: number;
  adaptiveReadinessScore: number;
  activeRemediationAlerts: Array<{
    category: string;
    reason: string;
    severity: 'high' | 'medium' | 'improved';
    action: string;
  }>;
}

const CATEGORY_TO_WEEK_MAP: Record<string, number> = {
  'Python': 1,
  'Generative AI': 1,
  'Stateful Multi-Agent': 2,
  'RAG': 3,
  'Machine Learning': 4,
  'System Design': 5
};

const CATEGORY_TO_SKILL_MAP: Record<string, string> = {
  'Python': 'Production Python Microservices & Streaming (FastAPI / SSE)',
  'Generative AI': 'Structured Outputs & Strict JSON Schema Tool Calling',
  'RAG': 'Hybrid RAG & Vector Search (Dense Embeddings + BM25 + Re-ranking)',
  'Machine Learning': 'Quantitative LLM Evaluation & Guardrails (Ragas)',
  'System Design': 'Stateful Multi-Agent Orchestration (LangGraph / StateGraph)'
};

export const adaptivePlanner = {
  /**
   * Deterministic Adaptive Replanning Engine (Zero LLM calls).
   * Dynamically adapts the 6-week curriculum based on interview scores,
   * while strictly preserving original baseline tasks and completion states.
   */
  replanRoadmap(
    baselineWeeks: WeeklyObjective[],
    interviewHistory: StudioHistoryEntry[],
    taskCompletionMap: Record<string, boolean>
  ): AdaptivePlanResult {
    // Deep clone baseline weeks to preserve original history
    const weeks: WeeklyObjective[] = JSON.parse(JSON.stringify(baselineWeeks));

    // Category performance aggregates
    const categoryStats: Record<string, {
      totalScores: number[];
      techDepthScores: number[];
      latestScore: number;
      latestTechDepth: number;
      weakCount: number;
      improved: boolean;
    }> = {};

    interviewHistory.forEach((item) => {
      const cat = item.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          totalScores: [],
          techDepthScores: [],
          latestScore: item.overall_score,
          latestTechDepth: item.dimension_scores.technical_depth.score,
          weakCount: 0,
          improved: false
        };
      }
      categoryStats[cat].totalScores.push(item.overall_score);
      const tdScore = item.dimension_scores.technical_depth.score;
      categoryStats[cat].techDepthScores.push(tdScore);

      if (tdScore < 3 || item.overall_score < 12) {
        categoryStats[cat].weakCount += 1;
      }
    });

    // Determine improvement trend: if latest score is >= 15/20 or tech depth >= 4
    Object.keys(categoryStats).forEach((cat) => {
      const stats = categoryStats[cat];
      if (stats.latestScore >= 15 || stats.latestTechDepth >= 4) {
        stats.improved = true;
      }
    });

    const activeAlerts: AdaptivePlanResult['activeRemediationAlerts'] = [];
    let adaptiveDrills = 0;
    let repeatedWeakness = 0;
    let improvedDomains = 0;

    // Apply Rule 1 & Rule 3: Technical Depth < 3 / Repeated Weakness
    interviewHistory.forEach((interview) => {
      const tdScore = interview.dimension_scores.technical_depth.score;
      const cat = interview.category;
      const targetWeekNum = CATEGORY_TO_WEEK_MAP[cat] || 1;
      const weekObj = weeks.find((w) => w.week_number === targetWeekNum);

      if (weekObj) {
        // If technical depth < 3: Inject or prioritize an Adaptive Practice Drill
        if (tdScore < 3) {
          adaptiveDrills += 1;
          const adaptiveTaskId = `adaptive-drill-${interview.id}`;

          // Avoid duplicate injection
          if (!weekObj.tasks.some((t) => t.id === adaptiveTaskId)) {
            const isCompleted = Boolean(taskCompletionMap[adaptiveTaskId]);
            weekObj.tasks.unshift({
              id: adaptiveTaskId,
              title: `🔥 Adaptive Practice Drill: Master Computational Mechanism for ${cat}`,
              skill_association: CATEGORY_TO_SKILL_MAP[cat] || 'Technical Reasoning & Architecture',
              estimated_hours: 2,
              priority: 'Adaptive Priority',
              completed: isCompleted,
              adaptive_practice: true,
              adaptive_reason: `Triggered by Interview Score: Technical Depth was ${tdScore}/5 on "${interview.question_text.slice(0, 40)}..."`
            });
          }
        }
      }
    });

    // Check for repeated weak performance (2+ low scores in same category)
    Object.entries(categoryStats).forEach(([cat, stats]) => {
      const targetWeekNum = CATEGORY_TO_WEEK_MAP[cat] || 1;
      const weekObj = weeks.find((w) => w.week_number === targetWeekNum);

      if (stats.weakCount >= 2 && weekObj) {
        repeatedWeakness += 1;
        activeAlerts.push({
          category: cat,
          reason: `Repeated Weak Performance: ${stats.weakCount} recent interview attempts scored below 3/5 in technical depth.`,
          severity: 'high',
          action: `All Week ${targetWeekNum} tasks escalated to Adaptive Priority. Complete these remediation drills before capstone defense.`
        });

        // Escalate existing tasks in this week to Adaptive Priority
        weekObj.tasks.forEach((t) => {
          if (!t.completed) {
            t.priority = 'Adaptive Priority';
            if (!t.adaptive_reason) {
              t.adaptive_reason = `Escalated: Repeated difficulty in ${cat} interviews (${stats.weakCount} low scores).`;
            }
          }
        });
      } else if (stats.improved) {
        improvedDomains += 1;
        activeAlerts.push({
          category: cat,
          reason: `Demonstrated Improvement: Recent interview achieved score of ${stats.latestScore}/20 (${stats.latestTechDepth}/5 technical depth).`,
          severity: 'improved',
          action: `Readiness index reinforced. Next actions shifted toward advanced multi-agent and capstone deliverables.`
        });

        // Add reinforced badge to week's tasks
        if (weekObj) {
          weekObj.tasks.forEach((t) => {
            if (t.completed) {
              t.adaptive_reason = `✨ Reinforced by Recent Interview Score (${stats.latestScore}/20)`;
            }
          });
        }
      }
    });

    // Apply completion states from taskCompletionMap
    let totalTasks = 0;
    let completedTasks = 0;

    weeks.forEach((w) => {
      w.tasks.forEach((t) => {
        totalTasks += 1;
        if (taskCompletionMap[t.id]) {
          t.completed = true;
          completedTasks += 1;
        } else {
          t.completed = false;
        }
      });
    });

    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate Adaptive Readiness Score (Grounded in baseline coverage + task completion + interview performance)
    const baseCoverage = 43; // Baseline from 3 JDs
    const taskBonus = Math.round((completionPct * 0.35)); // up to +35%
    const interviewBonus = interviewHistory.length > 0
      ? Math.round(
          (interviewHistory.reduce((acc, h) => acc + h.overall_score, 0) /
            (interviewHistory.length * 20)) *
            22
        )
      : 0; // up to +22%

    const adaptiveScore = Math.min(96, baseCoverage + taskBonus + interviewBonus);

    return {
      weeks,
      completedCount: completedTasks,
      totalTaskCount: totalTasks,
      completionPercentage: completionPct,
      adaptiveDrillCount: adaptiveDrills,
      repeatedWeaknessCount: repeatedWeakness,
      improvedCount: improvedDomains,
      adaptiveReadinessScore: adaptiveScore,
      activeRemediationAlerts: activeAlerts
    };
  }
};

