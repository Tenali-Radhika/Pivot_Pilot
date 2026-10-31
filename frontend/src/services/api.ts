import {
  CandidateProfileInput,
  JobDescriptionInput,
  CareerAnalysisResponse,
  InterviewQuestion,
  EvaluationResponse,
  ApplicationItem
} from '../types';
import { SYNTHETIC_SAMPLE_APPLICATIONS } from './storage';

const API_BASE = '/api';

export const apiService = {
  async checkHealth(): Promise<{ status: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async analyzeCareer(
    candidate: CandidateProfileInput,
    jobDescriptions: JobDescriptionInput[]
  ): Promise<CareerAnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyze-career`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate,
        job_descriptions: jobDescriptions
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Analysis failed with status ${res.status}`);
    }

    return await res.json();
  },

  async getDemoCareerData(): Promise<{
    candidate: CandidateProfileInput;
    job_descriptions: JobDescriptionInput[];
  }> {
    const res = await fetch(`${API_BASE}/analyze-career/demo-data`);
    if (!res.ok) throw new Error('Failed to fetch demo data');
    return await res.json();
  },

  async getStudioQuestions(category?: string, skillGap?: string): Promise<import('../types').StudioQuestionItem[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (skillGap) params.append('skill_gap', skillGap);
      const url = `${API_BASE}/interview/questions${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch studio questions');
      return await res.json();
    } catch (err) {
      console.warn('Using client-side fallback studio questions:', err);
      return [
        {
          id: "q-py-1",
          category: "Python",
          role_level: "Junior Engineer",
          difficulty: "Foundational",
          question: "How do Python generators differ from regular functions returning lists, and why are they critical when streaming tokens or processing large datasets?",
          context: "Tests understanding of memory efficiency, lazy evaluation, and the yield keyword vs eager loading in RAM.",
          expected_key_points: [
            "Lists load all elements into RAM at once; generators yield items one at a time on demand.",
            "Use of yield keyword to pause execution and preserve state.",
            "Streaming tokens: yields chunks to client without buffering complete model output.",
            "O(1) memory space complexity."
          ],
          connected_skill_gap: "Production Python Microservices & Streaming (FastAPI / SSE)",
          time_limit_seconds: 180
        },
        {
          id: "q-genai-1",
          category: "Generative AI",
          role_level: "Junior Engineer",
          difficulty: "Foundational",
          question: "What is temperature in an LLM call, and how does setting temperature to 0 versus 0.8 affect tool calling and creative tasks?",
          context: "Assesses understanding of token probability distributions, sampling randomness, and deterministic execution.",
          expected_key_points: [
            "Temperature scales logit distribution before softmax.",
            "Temperature = 0 (greedy decoding) makes selection deterministic and minimizes hallucinations for JSON/tool calls.",
            "Higher temperature flattens logits, increasing vocabulary diversity.",
            "Tool routing requires temperature near 0."
          ],
          connected_skill_gap: "Structured Outputs & Strict JSON Schema Tool Calling",
          time_limit_seconds: 180
        },
        {
          id: "q-rag-1",
          category: "RAG",
          role_level: "Junior Engineer",
          difficulty: "Foundational",
          question: "What is the difference between dense vector embeddings and lexical sparse search (BM25), and why do modern enterprise RAG systems combine both in hybrid search?",
          context: "Probes semantic similarity vs exact keyword matching, handling domain terminology and part numbers.",
          expected_key_points: [
            "Dense embeddings capture semantic meaning but struggle with exact keywords or acronyms.",
            "BM25 excels at exact token matches.",
            "Hybrid search merges scores via Reciprocal Rank Fusion.",
            "Cross-encoder reranking maximizes top-5 precision."
          ],
          connected_skill_gap: "Hybrid RAG & Vector Search (Dense Embeddings + BM25 + Re-ranking)",
          time_limit_seconds: 180
        },
        {
          id: "q-ml-1",
          category: "Machine Learning",
          role_level: "Junior Engineer",
          difficulty: "Foundational",
          question: "In vector search, what is the difference between Cosine Similarity and Euclidean Distance (L2), and when does normalization make them equivalent?",
          context: "Tests foundational geometric intuition behind embedding vector similarity metrics in databases like Qdrant.",
          expected_key_points: [
            "Cosine similarity measures the angle between vectors (direction), ignoring magnitude.",
            "Euclidean distance measures straight-line distance in space.",
            "When vectors are L2-normalized, Euclidean distance and Cosine similarity are monotonically related.",
            "Dot product is fastest when embeddings are pre-normalized."
          ],
          connected_skill_gap: "Vector Database Management & Indexing (Qdrant)",
          time_limit_seconds: 180
        },
        {
          id: "q-sys-1",
          category: "System Design",
          role_level: "Junior Engineer",
          difficulty: "Applied",
          question: "Design an AI-powered customer support triage service that accepts incoming tickets, classifies urgency, and retrieves knowledge base articles. How do you handle LLM rate limits and prevent duplicate processing?",
          context: "Evaluates end-to-end junior systems thinking: queues, idempotency, rate limiting, and fallback handling.",
          expected_key_points: [
            "Asynchronous message queue (RabbitMQ / Redis) decoupling ingestion from processing.",
            "Idempotency keys on tickets preventing duplicate calls.",
            "Token bucket or sliding window rate limiting.",
            "Semantic caching of frequent queries in Redis.",
            "Fallback rule-based triage if LLM experiences an outage."
          ],
          connected_skill_gap: "Stateful Multi-Agent Orchestration (LangGraph)",
          time_limit_seconds: 240
        }
      ];
    }
  },

  async evaluateInterviewStudio(payload: {
    question_id: string;
    question_text: string;
    category: string;
    target_role: string;
    candidate_answer: string;
    candidate_skill_gaps?: string[];
    duration_seconds?: number;
  }): Promise<import('../types').StudioEvaluationResponse> {
    // Try POST /api/evaluate-interview, with fallback to /aps/evaluate-interview
    try {
      const res = await fetch(`${API_BASE}/evaluate-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}

    try {
      const res2 = await fetch('/aps/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res2.ok) return await res2.json();
    } catch {}

    // Resilient fallback following exact prompt rules
    const raw = payload.candidate_answer.trim();
    const words = raw.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Remove fillers without inventing facts
    const cleanedUnstructured = raw
      .replace(/\b(um|uh|ah|you know|so basically|like)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanedStructured = `• Core Concept: ${cleanedUnstructured.slice(0, 100)}...\n• Technical Implementation: Grounded in candidate's original claims.\n• System Outcome: Evaluated against junior engineer criteria.`;

    const sScore = wordCount >= 40 ? 4 : 3;
    const tScore = wordCount >= 50 ? 4 : 3;
    const rScore = 5;
    const cScore = 4;
    const overall = sScore + tScore + rScore + cScore;

    return {
      original_answer: raw,
      cleaned_structured_answer: cleanedStructured,
      cleaned_unstructured_answer: cleanedUnstructured,
      dimension_scores: {
        structure: { score: sScore, feedback: 'Logical flow with clear progression between concept and implementation.' },
        technical_depth: { score: tScore, feedback: 'Sound technical reasoning grounded in foundational mechanisms.' },
        relevance: { score: rScore, feedback: 'Directly resolved the core question asked.' },
        clarity: { score: cScore, feedback: 'Clear verbal communication and intent.' }
      },
      overall_score: overall,
      percentage: Math.round((overall / 20) * 100),
      verdict: overall >= 17 ? 'Strong Hire' : overall >= 14 ? 'Hire' : 'Lean Hire',
      strengths: [
        'Maintained factual grounding without exaggerating claims.',
        'Clear articulation of core engineering concepts.'
      ],
      improvement_suggestions: [
        {
          suggestion: 'Quantify the memory or latency trade-off with concrete metrics.',
          connected_skill_gap: payload.candidate_skill_gaps?.[0] || 'Production Python Microservices & Streaming (FastAPI / SSE)',
          actionable_remedy: 'Practice explaining the exact Big-O space complexity and streaming latency numbers in your verbal answers.'
        }
      ],
      contextual_followups: [
        'How would you handle client connection drops during an active token streaming response?',
        'How would you benchmark this implementation in your CI pipeline before shipping to production?'
      ],
      provider_used: 'demo_fallback',
      is_live_ai: false,
      evaluation_note: 'Deterministic Studio Evaluation Mode (Preserves original facts without inventing knowledge; evaluates technical substance over accent or fillers).'
    };
  },

  async getInterviewQuestions(): Promise<InterviewQuestion[]> {
    try {
      const res = await fetch(`${API_BASE}/interview/questions`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      return await res.json();
    } catch {
      return [
        {
          id: 'q-pivot-1',
          category: 'Behavioral Pivot Narrative',
          difficulty: 'Medium',
          question: 'You have spent years excelling in software engineering. Why are you choosing to pivot into Gen AI Engineering now, and how does your existing background make you uniquely dangerous?',
          context: 'Interviewers want to see that you understand why systems and frontend mastery makes autonomous AI applications actually usable.',
          expected_key_points: [
            'inflection point: models need intuitive, reliable interfaces',
            'transferable skills: async state handling, WebSockets/streaming, UX empathy',
            'concrete projects: LangGraph workflows, hybrid RAG',
            'enthusiasm for non-deterministic reliability'
          ],
          time_limit_seconds: 180
        },
        {
          id: 'q-sys-2',
          category: 'System Architecture',
          difficulty: 'Hard',
          question: 'Walk me through how you would architect an autonomous agent that drafts enterprise sales proposals using company CRM data and PDF case studies. How do you prevent hallucinations and ensure low latency?',
          context: 'Assesses end-to-end agent design: tool routing, retrieval strategies, structured generation, and evaluation checks.',
          expected_key_points: [
            'Multi-stage agent architecture: Planner -> Retriever -> Drafter -> Evaluator',
            'Hybrid retrieval: Vector search + SQL/API tools',
            'Strict JSON schema with Pydantic / Instructor',
            'Latency optimizations: parallel retrieval, token streaming',
            'Evaluation guardrails: faithfulness cross-check'
          ],
          time_limit_seconds: 240
        },
        {
          id: 'q-tech-3',
          category: 'Technical Deep Dive',
          difficulty: 'Hard',
          question: 'In a cyclic multi-agent workflow orchestrated with a state graph, how do you handle state persistence, cyclic loop termination, and human-in-the-loop approvals?',
          context: 'Probes practical production experience with state machines like LangGraph or Temporal.',
          expected_key_points: [
            'Define state schema with typed reducers and append-only message history',
            'Implement recursion limits and conditional routing edges',
            'Checkpointing mechanisms to snapshot state',
            'Breakpoint pattern: halting state graph before critical tools for approval'
          ],
          time_limit_seconds: 200
        },
        {
          id: 'q-fail-4',
          category: 'Failure Handling & Guardrails',
          difficulty: 'Hard',
          question: 'An LLM tool-calling agent intermittently returns invalid JSON parameters or hallucinates arguments during peak loads. How do you diagnose and architect zero-downtime resilience for this?',
          context: 'Evaluates engineering maturity when working with probabilistic models.',
          expected_key_points: [
            'Retry loop with schema correction prompt',
            'Deterministic fallback parser',
            'Temperature tuning and small deterministic models for routing',
            'OpenTelemetry / Langfuse observability',
            'Graceful degradation to user clarification'
          ],
          time_limit_seconds: 180
        }
      ];
    }
  },

  async evaluateInterviewResponse(payload: {
    question_id: string;
    question_text: string;
    category: string;
    candidate_answer: string;
    duration_seconds: number;
    target_role: string;
  }): Promise<EvaluationResponse> {
    try {
      const res = await fetch(`${API_BASE}/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Evaluation call failed');
      return await res.json();
    } catch {
      const text = payload.candidate_answer.trim();
      const words = text.split(/\s+/).length;
      const score = Math.min(95, Math.max(55, Math.round(50 + (words * 0.4))));
      return {
        overall_score: score,
        verdict: score >= 80 ? 'Strong Hire' : (score >= 68 ? 'Lean Hire' : 'Needs Refinement'),
        star_methodology: {
          score: Math.min(94, score + 4),
          feedback: 'Effective structure connecting situation to action and measurable result.'
        },
        technical_depth: {
          score: score,
          feedback: 'Appropriate technical terminology applied to state management and agent architectures.'
        },
        delivery_clarity: {
          score: Math.min(92, score + 2),
          feedback: `Good verbal pacing (${words} words dictated in ${payload.duration_seconds}s).`
        },
        pivot_confidence: {
          score: Math.min(96, score + 6),
          feedback: 'Convincingly positions prior engineering foundation as an asset for AI agent reliability.'
        },
        strengths: [
          'High conversational clarity and well-paced voice delivery.',
          'Demonstrated clear understanding of system constraints.'
        ],
        areas_for_growth: [
          'Add one more specific metric (e.g., % improvement or latency ms).',
          'Mention automated evaluation frameworks like Ragas or TruLens.'
        ],
        model_answer_snippet: '"When designing our autonomous workflow, I architected a dual-loop LangGraph state machine with an outer planner and an inner evaluator. Using reciprocal rank fusion across vector embeddings and BM25 keywords, we reduced hallucination rates to under 3% while streaming responses via SSE."',
        suggested_followup: 'How would you test and benchmark this system before shipping to production users?'
      };
    }
  },

  async getPresetApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/applications/presets`);
      if (!res.ok) throw new Error('Failed to fetch application presets');
      return await res.json();
    } catch {
      return SYNTHETIC_SAMPLE_APPLICATIONS;
    }
  },

  async tailorPitch(company: string, role: string): Promise<{ elevator_pitch: string; key_selling_points: string[]; cover_note_hook: string }> {
    try {
      const res = await fetch(`${API_BASE}/applications/tailor-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role })
      });
      if (!res.ok) throw new Error('Failed to tailor pitch');
      return await res.json();
    } catch {
      return {
        elevator_pitch: `"With over 5 years architecting high-performance client applications, I bring a unique dual advantage to ${company}: I don't just build autonomous agent workflows in Python and LangGraph—I know how to deliver them into responsive, deterministic user experiences that users actually trust."`,
        key_selling_points: [
          `Bridges the gap between AI backend primitives and seamless user experience for ${company}.`,
          'Demonstrated portfolio code with state machines, hybrid retrieval, and automated Ragas evaluation.',
          'Proven track record of shipping production features under tight latency constraints.'
        ],
        cover_note_hook: `I was inspired by ${company}'s work in autonomous workflows. Having transitioned from full-stack architecture to agentic engineering, I understand firsthand how to turn non-deterministic LLMs into reliable enterprise products.`
      };
    }
  }
};
