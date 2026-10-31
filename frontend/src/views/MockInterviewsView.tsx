import React, { useState, useEffect, useRef } from 'react';
import {
  StudioQuestionItem,
  StudioEvaluationResponse,
  StudioHistoryEntry,
  InterviewCategory,
  NavigationTab
} from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import {
  Mic,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  FileQuestion,
  History,
  Trash2,
  Radio,
  BookOpen,
  Copy,
  Check,
  Cpu,
  Brain,
  Code2,
  Database,
  Network,
  Share2,
  ChevronRight,
  Info,
  Target,
  Flame,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface MockInterviewsViewProps {
  targetRole: string;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const MockInterviewsView: React.FC<MockInterviewsViewProps> = ({
  targetRole,
  onNavigateTab
}) => {
  const [categories] = useState<InterviewCategory[]>([
    'Python',
    'Generative AI',
    'RAG',
    'Machine Learning',
    'System Design'
  ]);
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory>('Python');
  
  const [questions, setQuestions] = useState<StudioQuestionItem[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<StudioQuestionItem | null>(null);
  
  // Natural Dictation Input (Wispr Flow compatible)
  const [dictatedAnswer, setDictatedAnswer] = useState<string>('');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Scorecard Result & Answer Mode View
  const [evaluation, setEvaluation] = useState<StudioEvaluationResponse | null>(null);
  const [answerViewMode, setAnswerViewMode] = useState<'structured' | 'unstructured' | 'original'>('structured');
  
  // History State
  const [history, setHistory] = useState<StudioHistoryEntry[]>([]);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Load questions and history on mount & when category changes
  useEffect(() => {
    async function loadQuestions() {
      const qs = await apiService.getStudioQuestions(selectedCategory);
      setQuestions(qs);
      if (qs.length > 0) {
        setSelectedQuestion(qs[0]);
        setDictatedAnswer('');
        setEvaluation(null);
      }
    }
    loadQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    const saved = storageService.getStudioHistory();
    setHistory(saved);
  }, []);

  // Timer handling for dictation
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  // Audio synthesis: Read Question Aloud
  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window) || !selectedQuestion) return;

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(selectedQuestion.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Sample Dictation Generator (Simulates natural speech dictated through Wispr Flow)
  const handleLoadSampleWisprDictation = () => {
    if (!selectedQuestion) return;
    
    let sample = "";
    if (selectedQuestion.category === "Python") {
      sample = "Um, so basically, Python generators differ from regular functions because, uh, instead of returning a full list that loads everything into RAM at once, a generator uses the yield keyword to produce items one at a time lazily. You know, this is super critical when streaming tokens from an LLM API because we can yield chunks over Server-Sent Events with O(1) space complexity without buffering gigabytes in memory.";
    } else if (selectedQuestion.category === "Generative AI") {
      sample = "Yeah so, temperature in an LLM call controls the randomness of the token probability distribution. Like, when you set temperature to 0, it does greedy decoding and always picks the most likely token, which is essential for deterministic tool calling and structured Pydantic schemas. Uh, on the other hand, setting it to 0.8 flattens the distribution and allows more creative vocabulary.";
    } else if (selectedQuestion.category === "RAG") {
      sample = "Well, dense embeddings capture semantic meaning and intent, but they kind of struggle with exact keywords, part numbers, or error codes. BM25, on the other hand, is a lexical search algorithm that excels at exact token matches. Modern enterprise RAG systems combine both in hybrid search using Reciprocal Rank Fusion, followed by a cross-encoder re-ranker to maximize top-5 precision.";
    } else if (selectedQuestion.category === "Machine Learning") {
      sample = "Cosine similarity measures the angle between two vectors, effectively comparing their direction while ignoring their magnitude. Euclidean distance, or L2, measures the actual geometric distance in space. Honestly, when vectors are L2-normalized to unit length of 1, Euclidean distance and Cosine similarity become monotonically related, and dot product becomes the fastest computation.";
    } else {
      sample = "To design an AI support triage service, I would use an asynchronous message queue like Redis or RabbitMQ to decouple ticket ingestion from slow LLM processing. To prevent duplicate calls during retries, we attach idempotency keys to each ticket. We'd also enforce a token bucket rate limiter to protect provider RPM limits and cache frequent answers in Redis.";
    }

    setDictatedAnswer(sample);
    setTimerSeconds(48);
  };

  // Submit Answer for AI Evaluation
  const handleSubmitEvaluation = async () => {
    if (!selectedQuestion || !dictatedAnswer.trim()) return;

    setIsEvaluating(true);
    setIsTimerActive(false);

    try {
      const response = await apiService.evaluateInterviewStudio({
        question_id: selectedQuestion.id,
        question_text: selectedQuestion.question,
        category: selectedQuestion.category,
        target_role: `${selectedQuestion.role_level} (${targetRole})`,
        candidate_answer: dictatedAnswer.trim(),
        candidate_skill_gaps: selectedQuestion.connected_skill_gap ? [selectedQuestion.connected_skill_gap] : [],
        duration_seconds: timerSeconds || 45
      });

      setEvaluation(response);

      // Save to local storage history
      const historyEntry: StudioHistoryEntry = {
        id: `studio-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        question_id: selectedQuestion.id,
        question_text: selectedQuestion.question,
        category: selectedQuestion.category,
        target_role: selectedQuestion.role_level,
        original_answer: response.original_answer,
        cleaned_structured_answer: response.cleaned_structured_answer,
        cleaned_unstructured_answer: response.cleaned_unstructured_answer,
        overall_score: response.overall_score,
        verdict: response.verdict,
        dimension_scores: response.dimension_scores
      };

      const updatedHistory = storageService.saveStudioHistoryEntry(historyEntry);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error('Interview studio evaluation error:', err);
      alert('Evaluation encountered a temporary issue. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePracticeFollowup = (followupText: string) => {
    const followupQ: StudioQuestionItem = {
      id: `q-followup-${Date.now()}`,
      category: selectedCategory,
      role_level: "Junior Engineer Follow-up",
      difficulty: "Applied",
      question: followupText,
      context: "Contextual follow-up question generated directly based on your previous dictated answer.",
      expected_key_points: [
        "Directly address the architectural trade-off or failure mode probed",
        "Demonstrate composed technical reasoning without guessing",
        "Connect system mechanisms to reliable production outcomes"
      ],
      connected_skill_gap: selectedQuestion?.connected_skill_gap,
      time_limit_seconds: 180
    };

    setSelectedQuestion(followupQ);
    setDictatedAnswer('');
    setEvaluation(null);
    setTimerSeconds(0);
    setIsTimerActive(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCopyCurrentAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all interview studio history from local storage?')) {
      storageService.clearStudioHistory();
      setHistory([]);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const wordCount = dictatedAnswer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. STUDIO HERO HEADER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-navy-950 border border-violet-500/40 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/25 text-violet-300 border border-violet-500/40 text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                <span>Voice-First AI Mock Interview Studio</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Target: Junior Engineer Role
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Natural Speech Technical Interview Simulator
            </h1>

            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Dictate answers naturally using <strong className="text-violet-300">Wispr Flow</strong> into the studio.
              Pivot Pilot evaluates your technical substance, structured reasoning, and connects growth areas
              directly back to your candidate skill gap analysis.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/80 border border-violet-500/30">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Sessions</span>
              <span className="text-2xl font-bold font-mono text-violet-400">{history.length}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Avg Score</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {history.length > 0
                  ? Math.round((history.reduce((acc, h) => acc + h.overall_score, 0) / (history.length * 20)) * 100)
                  : '--'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY SWITCHER PILLS (Python, Gen AI, RAG, ML, System Design) */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Select Interview Domain & Category:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-400/50 shadow-lg shadow-violet-600/30 scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{cat}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-violet-200' : 'text-slate-500'}`}>
                    Junior Level
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-800'}`}>
                  {cat === 'Python' && <Code2 className="w-4 h-4" />}
                  {cat === 'Generative AI' && <Brain className="w-4 h-4" />}
                  {cat === 'RAG' && <Database className="w-4 h-4" />}
                  {cat === 'Machine Learning' && <Cpu className="w-4 h-4" />}
                  {cat === 'System Design' && <Network className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN STUDIO GRID: Left = Questions & Context; Right = Wispr Flow Input & Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Question Picker & Question Context */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileQuestion className="w-4 h-4 text-violet-400" />
              {selectedCategory} Questions
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {questions.length} in Bank
            </span>
          </div>

          {/* Question List */}
          <div className="space-y-2">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setDictatedAnswer('');
                    setEvaluation(null);
                    setTimerSeconds(0);
                    setIsTimerActive(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-violet-500 shadow-md shadow-violet-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ~3 mins
                    </span>
                  </div>
                  <h3 className={`text-xs font-semibold leading-relaxed ${
                    isSelected ? 'text-white font-bold' : 'text-slate-300'
                  }`}>
                    {q.question}
                  </h3>
                  
                  {q.connected_skill_gap && (
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className="truncate">Tests Gap: {q.connected_skill_gap}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Question Spotlight + Wispr Flow Input + Scorecard */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Question Details */}
          {selectedQuestion && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-violet-500/30 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-violet-300 bg-violet-950/70 px-2.5 py-1 rounded-md border border-violet-800">
                    {selectedQuestion.category} · {selectedQuestion.role_level}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                    {selectedQuestion.difficulty}
                  </span>
                </div>

                {/* Hear Question Aloud Action */}
                <button
                  onClick={handleSpeakQuestion}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSpeakingQuestion
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
                  }`}
                  title="Listen to interviewer speak this question"
                >
                  {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
                  <span>{isSpeakingQuestion ? 'Stop Audio' : 'Hear Question'}</span>
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
                "{selectedQuestion.question}"
              </h2>

              <p className="text-xs text-slate-400 italic">
                💡 <span className="font-semibold text-slate-300">Interviewer Context:</span> {selectedQuestion.context}
              </p>

              {/* Connected Skill Gap Banner */}
              {selectedQuestion.connected_skill_gap && (
                <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-violet-300">
                    <Target className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span><strong>Connected to Candidate Skill Gap:</strong> {selectedQuestion.connected_skill_gap}</span>
                  </div>
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Gap Focus</span>
                </div>
              )}

              {/* Key concepts */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Substantive Points Interviewers Look For:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
                  {selectedQuestion.expected_key_points.map((pt, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. WISPR FLOW NATURAL DICTATION INPUT FIELD */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-violet-500/30 shadow-2xl space-y-4">
            
            {/* Dictation Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">Wispr Flow Dictation Input</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Natural Speech Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dictate naturally using Wispr Flow into this input field. You can review and edit your raw text before submitting.
                  </p>
                </div>
              </div>

              {/* Controls: Sample Dictation, Timer, Clear */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLoadSampleWisprDictation}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-800/60 transition-colors"
                  title="Paste a realistic spoken dictation with natural speech phrasing for testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Paste Wispr Dictation</span>
                </button>

                {dictatedAnswer && (
                  <button
                    type="button"
                    onClick={() => {
                      setDictatedAnswer('');
                      setTimerSeconds(0);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700"
                    title="Clear input field"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Answer Input Area */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-300">Dictated Response Text:</span>
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{dictatedAnswer.length} chars</span>
                  {timerSeconds > 0 && <span>· Time: {formatTime(timerSeconds)}</span>}
                </div>
              </div>

              <textarea
                rows={6}
                value={dictatedAnswer}
                onFocus={() => setIsTimerActive(true)}
                onChange={(e) => setDictatedAnswer(e.target.value)}
                placeholder="Click here and dictate using Wispr Flow, or type directly... Speak naturally — harmless fillers ('um', 'uh') will not be penalized during technical reasoning evaluation."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 font-sans leading-relaxed resize-y focus:outline-none transition-all"
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Evaluates Structure (/5), Technical Depth (/5), Relevance (/5), and Clarity (/5).</span>
              </div>

              <button
                onClick={handleSubmitEvaluation}
                disabled={!dictatedAnswer.trim() || isEvaluating}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  !dictatedAnswer.trim() || isEvaluating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02]'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Technical Substance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    <span>Submit Answer for AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. HERO SCORECARD: 4 DIMENSIONS & GAP-CONNECTED FEEDBACK */}
          {evaluation && (
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 border border-violet-500/50 shadow-2xl space-y-6 animate-fadeIn">
              
              {/* Scorecard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold mb-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Technical Scorecard Complete</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Junior Engineer Evaluation Scorecard
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{evaluation.evaluation_note}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Hiring Verdict</span>
                    <span className={`text-sm font-extrabold uppercase px-3.5 py-1 rounded-full inline-block mt-0.5 ${
                      evaluation.verdict === 'Strong Hire'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : evaluation.verdict === 'Hire'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : evaluation.verdict === 'Lean Hire'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {evaluation.verdict}
                    </span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-violet-500/40 flex flex-col items-center justify-center shadow-inner flex-shrink-0">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
                        {evaluation.overall_score}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/20</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{evaluation.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* 4 DIMENSION METERS (Score out of 5 each) WITH DETAILED WHY-EXPLANATIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-violet-400" />
                    Four Evaluated Dimensions (Substantive Diagnostic Rubric):
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Sum: {evaluation.overall_score} / 20 Points</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  {/* Dimension 1: Structure */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-200">1. Structure & Flow</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          evaluation.dimension_scores.structure.score >= 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {evaluation.dimension_scores.structure.score >= 4 ? 'Clear Logical Flow' : 'Needs Tighter Structure'}
                        </span>
                        <span className="text-violet-300 font-mono text-sm">{evaluation.dimension_scores.structure.score} / 5</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${(evaluation.dimension_scores.structure.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
                        Why this score was awarded:
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {evaluation.dimension_scores.structure.feedback}
                      </p>
                    </div>
                  </div>

                  {/* Dimension 2: Technical Depth */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-200">2. Technical Depth</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          evaluation.dimension_scores.technical_depth.score >= 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : evaluation.dimension_scores.technical_depth.score === 3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {evaluation.dimension_scores.technical_depth.score >= 4
                            ? 'Demonstrated Mechanisms'
                            : evaluation.dimension_scores.technical_depth.score === 3
                            ? 'Partial Context'
                            : 'Triggers Adaptive Drill'}
                        </span>
                        <span className="text-purple-300 font-mono text-sm">{evaluation.dimension_scores.technical_depth.score} / 5</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(evaluation.dimension_scores.technical_depth.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                        Why this score was awarded:
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {evaluation.dimension_scores.technical_depth.feedback}
                      </p>
                    </div>
                  </div>

                  {/* Dimension 3: Relevance */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-200">3. Relevance to Question</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          evaluation.dimension_scores.relevance.score >= 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {evaluation.dimension_scores.relevance.score >= 4 ? 'Directly Answered' : 'Tangential Details'}
                        </span>
                        <span className="text-emerald-300 font-mono text-sm">{evaluation.dimension_scores.relevance.score} / 5</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(evaluation.dimension_scores.relevance.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Why this score was awarded:
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {evaluation.dimension_scores.relevance.feedback}
                      </p>
                    </div>
                  </div>

                  {/* Dimension 4: Clarity */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-200">4. Clarity & Precision</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          evaluation.dimension_scores.clarity.score >= 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {evaluation.dimension_scores.clarity.score >= 4 ? 'Precise Technical Terms' : 'Conversational Style'}
                        </span>
                        <span className="text-indigo-300 font-mono text-sm">{evaluation.dimension_scores.clarity.score} / 5</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(evaluation.dimension_scores.clarity.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                        Why this score was awarded:
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {evaluation.dimension_scores.clarity.feedback}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* SIDE-BY-SIDE SPOKEN DICTATION VS AI-CLEANED ANSWER COMPARISON */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      Side-by-Side Answer Comparison (Speech Ingestion vs Fact-Preserved Polish)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Compare raw spoken speech from Wispr Flow against the candidate's structured technical answer.
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
                    <button
                      onClick={() => setAnswerViewMode('structured')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        answerViewMode === 'structured'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Structured Bullets
                    </button>
                    <button
                      onClick={() => setAnswerViewMode('unstructured')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        answerViewMode === 'unstructured'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fluent Prose
                    </button>
                  </div>
                </div>

                {/* 2-Column Side-by-Side Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Column: Raw Spoken Dictation */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Mic className="w-3 h-3 text-amber-400" />
                          <span>Original Spoken Dictation (Wispr Flow)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Verbatim Speech</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 min-h-[140px]">
                        {evaluation.original_answer}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-1">
                      💡 Natural speech ingested directly without penalizing colloquialisms or pauses.
                    </div>
                  </div>

                  {/* Right Column: AI-Cleaned Fact-Preserved Answer */}
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>AI Cleaned & Structured (Zero Hallucination)</span>
                        </span>
                        <button
                          onClick={() => handleCopyCurrentAnswer(
                            answerViewMode === 'structured'
                              ? evaluation.cleaned_structured_answer
                              : evaluation.cleaned_unstructured_answer
                          )}
                          className="text-[10px] font-semibold text-violet-400 hover:text-violet-200 flex items-center gap-1"
                        >
                          {copiedAnswer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 min-h-[140px]">
                        {answerViewMode === 'structured' ? evaluation.cleaned_structured_answer : evaluation.cleaned_unstructured_answer}
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-400/90 font-medium pt-1">
                      ✓ Factual claims, trade-offs, and metrics strictly preserved from candidate speech.
                    </div>
                  </div>

                </div>

                {/* Fairness Banner */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Fair Evaluation Protocol:</strong> Pivot Pilot measures substantive technical reasoning and mechanisms. Candidates are never penalized for harmless verbal fillers, accents, or vocal cadence.
                  </span>
                </div>
              </div>

              {/* 5. ADAPTIVE ROADMAP INFLUENCE BANNER (EXPLAINS HOW INTERVIEW RESULTS INFLUENCE CURRICULUM) */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                evaluation.dimension_scores.technical_depth.score < 3 || evaluation.overall_score < 14
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 text-amber-200'
                  : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-200'
              }`}>
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    evaluation.dimension_scores.technical_depth.score < 3
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {evaluation.dimension_scores.technical_depth.score < 3 ? (
                      <Flame className="w-5 h-5 animate-pulse" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        Deterministic Adaptive Replanner
                      </span>
                      <span className="font-bold text-white">
                        {evaluation.dimension_scores.technical_depth.score < 3
                          ? '🔥 Adaptive Practice Drill Injected'
                          : '✨ Curriculum Momentum Accelerated'}
                      </span>
                    </div>

                    <p className="text-slate-200 font-semibold leading-relaxed">
                      {evaluation.dimension_scores.technical_depth.score < 3
                        ? `Because Technical Depth scored ${evaluation.dimension_scores.technical_depth.score}/5 on "${selectedQuestion?.category || 'this topic'}", an Adaptive Practice Drill targeting "${selectedQuestion?.connected_skill_gap || 'Core Engineering'}" has been prioritized into Week 1 / Week 2 of your 6-Week Learning Roadmap.`
                        : `Strong demonstration (${evaluation.overall_score}/20)! Your performance validates mastery against "${selectedQuestion?.connected_skill_gap || 'target competencies'}" and reinforces your Adaptive Readiness Score.`}
                    </p>

                    <p className="text-slate-400 text-[11px]">
                      Pure application-code replanning without making another LLM call. All modifications persist in local storage.
                    </p>
                  </div>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('roadmap')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1.5 self-start sm:self-center shrink-0 shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02]"
                  >
                    <span>{evaluation.dimension_scores.technical_depth.score < 3 ? 'View Injected Drill in Roadmap' : 'Review Updated 6-Week Roadmap'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Observed Strengths & Gap-Connected Improvement Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Observed Technical Strengths
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements Connected to Skill Gaps */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    Improvement Connected to Skill Gaps
                  </h4>
                  <div className="space-y-2.5 text-[11px]">
                    {evaluation.improvement_suggestions.map((imp, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-amber-300">Target Area:</span>
                          <span className="text-slate-200">{imp.suggestion}</span>
                        </div>
                        <div className="text-[10px] font-bold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800 inline-block">
                          Connected Gap: {imp.connected_skill_gap}
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          Action: {imp.actionable_remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* CONTEXTUAL FOLLOW-UP QUESTIONS */}
              {evaluation.contextual_followups.length > 0 && (
                <div className="p-5 rounded-2xl bg-violet-950/30 border border-violet-500/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Contextual Follow-Up Questions (Probe Your Answer):
                  </span>

                  <div className="space-y-2">
                    {evaluation.contextual_followups.map((followup, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <p className="text-xs font-semibold text-slate-200">
                          "{followup}"
                        </p>
                        <button
                          onClick={() => handlePracticeFollowup(followup)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1.5 self-start sm:self-auto flex-shrink-0 transition-all shadow-sm"
                        >
                          <span>Practice Follow-up</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 6. HISTORY LOG OF INTERVIEW ATTEMPTS */}
          {history.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-violet-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Personal Interview Studio History ({history.length} Sessions Saved)
                  </h3>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {history.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-violet-400">{entry.category}</span>
                        <span className="text-[10px] text-slate-500">· {entry.timestamp}</span>
                      </div>
                      <p className="font-semibold text-slate-200 line-clamp-1">
                        {entry.question_text}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                        "{entry.original_answer}"
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-violet-300">
                          {entry.overall_score} / 20
                        </span>
                        <div className="text-[10px] text-slate-500">
                          S:{entry.dimension_scores.structure.score} T:{entry.dimension_scores.technical_depth.score} R:{entry.dimension_scores.relevance.score} C:{entry.dimension_scores.clarity.score}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        entry.verdict === 'Strong Hire' || entry.verdict === 'Hire'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {entry.verdict}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
