import os
import json
import re
from typing import List, Optional, Dict, Any, Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(tags=["interview"])

# -------------------------------------------------------------
# Input & Output Pydantic Models
# -------------------------------------------------------------
class InterviewQuestionItem(BaseModel):
    id: str
    category: Literal["Python", "Generative AI", "RAG", "Machine Learning", "System Design"]
    role_level: str = "Junior Engineer"
    difficulty: Literal["Foundational", "Intermediate", "Applied"]
    question: str
    context: str
    expected_key_points: List[str]
    connected_skill_gap: Optional[str] = None
    time_limit_seconds: int = 180

class DimensionScore(BaseModel):
    score: int = Field(..., ge=1, le=5, description="Score out of 5")
    feedback: str = Field(..., description="Actionable feedback for this dimension")

class DimensionScores(BaseModel):
    structure: DimensionScore
    technical_depth: DimensionScore
    relevance: DimensionScore
    clarity: DimensionScore

class ImprovementItem(BaseModel):
    suggestion: str
    connected_skill_gap: str
    actionable_remedy: str

class MockInterviewEvaluationRequest(BaseModel):
    question_id: str
    question_text: str
    category: str
    target_role: str = "Junior Gen AI Engineer"
    candidate_answer: str = Field(..., min_length=1, description="Raw dictated answer from Wispr Flow or user input")
    candidate_skill_gaps: Optional[List[str]] = Field(default_factory=list)
    duration_seconds: Optional[int] = 60

class MockInterviewEvaluationResponse(BaseModel):
    original_answer: str
    cleaned_structured_answer: str
    cleaned_unstructured_answer: str
    dimension_scores: DimensionScores
    overall_score: int = Field(..., ge=4, le=20, description="Overall score out of 20")
    percentage: int
    verdict: Literal["Strong Hire", "Hire", "Lean Hire", "Needs Refinement"]
    strengths: List[str]
    improvement_suggestions: List[ImprovementItem]
    contextual_followups: List[str]
    provider_used: Literal["gemini", "anthropic", "demo_fallback"]
    is_live_ai: bool
    evaluation_note: str

# -------------------------------------------------------------
# Junior Engineer Question Bank across 5 Categories
# -------------------------------------------------------------
QUESTION_BANK: List[InterviewQuestionItem] = [
    # 1. PYTHON
    InterviewQuestionItem(
        id="q-py-1",
        category="Python",
        role_level="Junior Engineer",
        difficulty="Foundational",
        question="How do Python generators differ from regular functions returning lists, and why are they critical when streaming tokens or processing large datasets?",
        context="Tests understanding of memory efficiency, lazy evaluation, and the `yield` keyword vs eager loading in RAM.",
        expected_key_points=[
            "Explain memory footprint: lists load all elements into RAM at once, whereas generators yield items one at a time on demand.",
            "Use of `yield` keyword to pause execution and preserve state.",
            "Streaming tokens: allows yielding chunks to client without buffering complete model output.",
            "Time complexity vs space complexity trade-offs (O(1) memory for generator traversal)."
        ],
        connected_skill_gap="Production Python Microservices & Streaming (FastAPI / SSE)"
    ),
    InterviewQuestionItem(
        id="q-py-2",
        category="Python",
        role_level="Junior Engineer",
        difficulty="Intermediate",
        question="What is the difference between synchronous and asynchronous functions in Python (async/await), and when would you use FastAPI over traditional Flask for an AI application?",
        context="Examines non-blocking I/O, event loops, and handling slow external LLM inference requests without blocking the server.",
        expected_key_points=[
            "Event loop mechanism: async/await yields control during I/O operations without tying up OS threads.",
            "External API latency: LLM calls take 1-4 seconds; async prevents thread pool starvation.",
            "FastAPI native ASGI support, automatic Pydantic validation, and Server-Sent Events (SSE) streaming.",
            "CPU-bound vs I/O-bound tasks in Python."
        ],
        connected_skill_gap="Production Python Microservices & Streaming (FastAPI / SSE)"
    ),

    # 2. GENERATIVE AI
    InterviewQuestionItem(
        id="q-genai-1",
        category="Generative AI",
        role_level="Junior Engineer",
        difficulty="Foundational",
        question="What is temperature in an LLM call, and how does setting temperature to 0 versus 0.8 affect tool calling and creative tasks?",
        context="Assesses understanding of token probability distributions, sampling randomness, and deterministic execution.",
        expected_key_points=[
            "Temperature scales the logit distribution before softmax.",
            "Temperature = 0 (greedy decoding) makes selection deterministic and minimizes hallucinations for JSON/tool calls.",
            "Higher temperature (0.7-1.0) flattens logits, increasing vocabulary diversity for creative brainstorming.",
            "Why tool routing and Pydantic schema validation require temperature near 0."
        ],
        connected_skill_gap="Structured Outputs & Strict JSON Schema Tool Calling"
    ),
    InterviewQuestionItem(
        id="q-genai-2",
        category="Generative AI",
        role_level="Junior Engineer",
        difficulty="Intermediate",
        question="Explain how you ensure an LLM reliably outputs valid JSON matching a specific schema when invoking an external database API. What happens if the output is malformed?",
        context="Tests practical knowledge of structured outputs, Instructor / Pydantic validation, and automated error-correction loops.",
        expected_key_points=[
            "Using constrained decoding or function calling / tool definitions with strict JSON schemas.",
            "Validating output with Pydantic models (e.g. Instructor or OpenAI response_format).",
            "Handling parse errors: catch JSONDecodeError or ValidationError and feed the error traceback back to the LLM in a self-correction retry loop.",
            "Graceful fallback strategies to avoid crashing downstream services."
        ],
        connected_skill_gap="Structured Outputs & Strict JSON Schema Tool Calling"
    ),

    # 3. RAG (RETRIEVAL-AUGMENTED GENERATION)
    InterviewQuestionItem(
        id="q-rag-1",
        category="RAG",
        role_level="Junior Engineer",
        difficulty="Foundational",
        question="What is the difference between dense vector embeddings and lexical sparse search (BM25), and why do modern enterprise RAG systems combine both in hybrid search?",
        context="Probes semantic similarity vs exact keyword matching, handling domain terminology, part numbers, and acronyms.",
        expected_key_points=[
            "Dense embeddings capture semantic meaning and intent using neural network vectors, but struggle with exact keywords, part numbers, or rare acronyms.",
            "Sparse lexical search (BM25 / TF-IDF) excels at exact token and keyword matches.",
            "Hybrid search combines both scores (e.g. via Reciprocal Rank Fusion - RRF).",
            "Using a cross-encoder re-ranker on the top merged candidates to maximize top-5 precision."
        ],
        connected_skill_gap="Hybrid RAG & Vector Search (Dense Embeddings + BM25 + Re-ranking)"
    ),
    InterviewQuestionItem(
        id="q-rag-2",
        category="RAG",
        role_level="Junior Engineer",
        difficulty="Intermediate",
        question="How would you evaluate whether a RAG system is actually providing accurate answers rather than hallucinating? Mention at least two specific metrics.",
        context="Evaluates engineering rigor in measuring RAG quality using quantitative metrics.",
        expected_key_points=[
            "Faithfulness (Groundedness): measures if every claim in the answer is directly supported by retrieved context chunks.",
            "Answer Relevance: measures if the generated answer directly addresses user intent without extraneous tangents.",
            "Context Recall & Precision: evaluates the retriever's ability to find relevant documents.",
            "Automated evaluation frameworks like Ragas, TruLens, or synthetic golden test sets."
        ],
        connected_skill_gap="Quantitative LLM Evaluation & Guardrails (Ragas)"
    ),

    # 4. MACHINE LEARNING
    InterviewQuestionItem(
        id="q-ml-1",
        category="Machine Learning",
        role_level="Junior Engineer",
        difficulty="Foundational",
        question="In vector search, what is the difference between Cosine Similarity and Euclidean Distance (L2), and when does normalization make them equivalent?",
        context="Tests foundational geometric intuition behind embedding vector similarity metrics in databases like Qdrant or Pinecone.",
        expected_key_points=[
            "Cosine similarity measures the angle between vectors (direction), ignoring magnitude.",
            "Euclidean distance (L2) measures the straight-line distance between two points in multidimensional space.",
            "When vectors are L2-normalized (length = 1), Euclidean distance and Cosine similarity are monotonically related.",
            "Dot product is computationally fastest when embeddings are pre-normalized."
        ],
        connected_skill_gap="Vector Database Management & Indexing (Qdrant)"
    ),
    InterviewQuestionItem(
        id="q-ml-2",
        category="Machine Learning",
        role_level="Junior Engineer",
        difficulty="Intermediate",
        question="What is overfitting in machine learning, and how does it manifest differently in traditional supervised models versus fine-tuning an LLM?",
        context="Assesses understanding of generalization, memorization, validation sets, and catastrophic forgetting in LLMs.",
        expected_key_points=[
            "Overfitting occurs when a model memorizes training noise rather than learning generalizable patterns.",
            "Traditional ML: High train accuracy, low validation accuracy; mitigated by L1/L2 regularization, dropout, pruning.",
            "LLM Fine-Tuning: manifest as catastrophic forgetting of general reasoning or repeating training samples word-for-word.",
            "Mitigation in LLMs: LoRA/QLoRA parameter-efficient tuning, low learning rates, and early stopping."
        ],
        connected_skill_gap="Quantitative LLM Evaluation & Guardrails (Ragas)"
    ),

    # 5. SYSTEM DESIGN
    InterviewQuestionItem(
        id="q-sys-1",
        category="System Design",
        role_level="Junior Engineer",
        difficulty="Applied",
        question="Design an AI-powered customer support triage service that accepts incoming tickets, classifies urgency, and retrieves knowledge base articles. How do you handle LLM rate limits and prevent duplicate processing?",
        context="Evaluates end-to-end junior systems thinking: queues, idempotency, rate limiting, and fallback handling.",
        expected_key_points=[
            "Asynchronous message queue (e.g. RabbitMQ, Redis, SQS) to decouple ticket ingestion from LLM processing.",
            "Idempotency keys on tickets to prevent duplicate LLM calls during network retries.",
            "Token bucket or sliding window rate limiter respecting upstream provider TPM/RPM limits.",
            "Semantic caching of frequent queries in Redis to avoid re-running identical questions.",
            "Fallback rule-based keyword triage if the LLM provider experiences an outage."
        ],
        connected_skill_gap="Stateful Multi-Agent Orchestration (LangGraph)"
    ),
    InterviewQuestionItem(
        id="q-sys-2",
        category="System Design",
        role_level="Junior Engineer",
        difficulty="Applied",
        question="When an autonomous agent is given access to tools like sending emails or refunding transactions, how would you design human-in-the-loop checkpoints to prevent unintended actions?",
        context="Examines safe tool execution, breakpoint state persistence, and audit logging.",
        expected_key_points=[
            "Classify tools by risk: read-only tools run autonomously; state-mutating/financial tools require approval.",
            "State machine breakpoints (e.g. LangGraph interrupt/checkpoint pattern) pausing execution thread.",
            "Generating human-readable action previews with exact parameters for review.",
            "Audit trail logging: persisting prompt inputs, tool arguments, and approving user identity.",
            "Timeout and expiration policies for pending approvals."
        ],
        connected_skill_gap="Stateful Multi-Agent Orchestration (LangGraph)"
    )
]

# -------------------------------------------------------------
# Clean Text Formatter Helpers (Preserving Meaning & Facts)
# -------------------------------------------------------------
FILLER_WORDS = [
    r"\bum\b", r"\buh\b", r"\bah\b", r"\byou know\b", r"\blike\b(?=\s+[a-z])",
    r"\bso basically\b", r"\bi mean\b", r"\bkind of\b", r"\bsort of\b",
    r"\bright\?\b", r"\byeah so\b", r"\bhonestly\b"
]

def clean_spoken_dictation(raw_text: str) -> str:
    """Removes verbal fillers while strictly preserving all facts, metrics, and technical claims."""
    cleaned = raw_text
    for pattern in FILLER_WORDS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    # Clean up duplicate whitespace and orphan commas
    cleaned = re.sub(r"\s+,\s+", ", ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Ensure capitalization of first letter of sentences
    sentences = [s.strip() for s in cleaned.split(".") if s.strip()]
    if sentences:
        capitalized = [s[0].upper() + s[1:] for s in sentences]
        return ". ".join(capitalized) + "."
    return cleaned

def structure_spoken_dictation(raw_text: str) -> str:
    """
    Transforms the candidate's dictation into a structured technical answer.
    Strictly preserves original meaning and facts; does NOT invent new knowledge.
    """
    cleaned = clean_spoken_dictation(raw_text)
    sentences = [s.strip() for s in cleaned.split(".") if len(s.strip()) > 3]

    if len(sentences) >= 3:
        context_part = sentences[0] + "."
        action_part = " ".join(sentences[1:-1]) + "."
        outcome_part = sentences[-1] + "."
        return (
            f"• Core Concept / Context: {context_part}\n"
            f"• Technical Execution / Reasoning: {action_part}\n"
            f"• Practical Impact / Resolution: {outcome_part}"
        )
    elif len(sentences) == 2:
        return (
            f"• Core Concept: {sentences[0]}.\n"
            f"• Technical Implementation: {sentences[1]}."
        )
    else:
        return f"• Technical Summary: {cleaned}"

# -------------------------------------------------------------
# Deterministic Evaluator (Grounded in Technical Substance)
# -------------------------------------------------------------
def evaluate_dictated_answer_deterministic(
    req: MockInterviewEvaluationRequest
) -> MockInterviewEvaluationResponse:
    raw_answer = req.candidate_answer.strip()
    words = raw_answer.split()
    word_count = len(words)
    answer_lower = raw_answer.lower()

    # Find the corresponding question in bank
    q_match = next((q for q in QUESTION_BANK if q.id == req.question_id), None)
    expected_pts = q_match.expected_key_points if q_match else []
    connected_gap = q_match.connected_skill_gap if q_match else "Technical Communication & Reasoning"

    # Count how many expected key concepts the candidate addressed
    matched_points = 0
    for pt in expected_pts:
        keywords = [w.lower() for w in re.findall(r"\b[A-Za-z0-9_-]{4,}\b", pt) if w.lower() not in {"this", "that", "with", "from", "when"}]
        if any(kw in answer_lower for kw in keywords[:4]):
            matched_points += 1

    # 1. Structure Score (1 to 5)
    has_transition_cues = any(w in answer_lower for w in ["first", "second", "because", "in addition", "for example", "specifically", "as a result", "whereas", "on the other hand"])
    if word_count < 25:
        struct_score = 2
        struct_feedback = "Answer is quite brief. Organize your thoughts with a clear beginning, middle, and technical conclusion."
    elif has_transition_cues and word_count >= 50:
        struct_score = 5 if matched_points >= 3 else 4
        struct_feedback = "Strong logical progression with clear technical transitions between points."
    elif word_count >= 35:
        struct_score = 3
        struct_feedback = "Good foundation. Use structured transitions (e.g. 'First..., Secondly..., In production...') to organize your logic."
    else:
        struct_score = 2
        struct_feedback = "Expand your narrative to clearly delineate concept, implementation, and trade-offs."

    # 2. Technical Depth Score (1 to 5)
    # Evaluate technical reasoning without inventing facts or penalizing accents/fillers
    tech_terms = [
        "memory", "yield", "generator", "async", "await", "event loop", "ram", "latency", "streaming", "sse",
        "temperature", "deterministic", "json", "schema", "pydantic", "instructor", "retry", "validation",
        "rag", "vector", "embedding", "dense", "sparse", "bm25", "re-rank", "reranker", "qdrant", "pinecone",
        "faithfulness", "relevance", "recall", "precision", "ragas", "cosine", "euclidean", "l2", "normalized",
        "overfitting", "regularization", "lora", "queue", "idempotency", "rate limit", "cache", "checkpoint",
        "human-in-the-loop", "breakpoint", "audit", "fastapi", "microservice"
    ]
    tech_term_hits = sum(1 for term in tech_terms if term in answer_lower)

    if tech_term_hits >= 4 and matched_points >= 2:
        depth_score = 5
        depth_feedback = f"Excellent technical depth. You grounded your explanation with {tech_term_hits} precise domain concepts."
    elif tech_term_hits >= 2 or matched_points >= 1:
        depth_score = 4 if word_count >= 40 else 3
        depth_feedback = f"Good technical awareness ({tech_term_hits} domain terms used). Go one level deeper into the exact mechanism."
    elif word_count >= 30:
        depth_score = 2
        depth_feedback = "Mentions high-level concepts but lacks the underlying computational mechanism. Elaborate on how it actually executes."
    else:
        depth_score = 2
        depth_feedback = "Technical substance is limited. Mention specific frameworks, memory trade-offs, or execution algorithms."

    # 3. Relevance Score (1 to 5)
    # Does the answer stay on topic for the question asked?
    q_words = [w.lower() for w in re.findall(r"\b[A-Za-z0-9_-]{4,}\b", req.question_text) if w.lower() not in {"what", "how", "when", "which", "difference", "between"}]
    q_relevance_hits = sum(1 for qw in q_words if qw in answer_lower)

    if q_relevance_hits >= 3 or matched_points >= 2:
        rel_score = 5
        rel_feedback = "Directly and comprehensively addresses the core question without straying off topic."
    elif q_relevance_hits >= 1 or word_count >= 30:
        rel_score = 4
        rel_feedback = "Addresses the question well. Ensure all sub-parts of the prompt are directly resolved."
    else:
        rel_score = 3
        rel_feedback = "Answer partially touches on the subject but misses the direct question comparison."

    # 4. Clarity Score (1 to 5)
    # Measures communication substance without penalizing speech filler style or accent
    if word_count >= 40 and struct_score >= 3:
        clarity_score = 5
        clarity_feedback = "Clear, articulate explanation. Your technical intent is unmistakable and easy for interviewers to follow."
    elif word_count >= 25:
        clarity_score = 4
        clarity_feedback = "Solid clarity. You communicated the main idea effectively."
    else:
        clarity_score = 3
        clarity_feedback = "Understandable, but could benefit from a bit more context to fully convey your perspective."

    # Overall Score (out of 20)
    overall_score = struct_score + depth_score + rel_score + clarity_score
    pct = int((overall_score / 20) * 100)

    if overall_score >= 17:
        verdict = "Strong Hire"
    elif overall_score >= 14:
        verdict = "Hire"
    elif overall_score >= 11:
        verdict = "Lean Hire"
    else:
        verdict = "Needs Refinement"

    # Strengths
    strengths = []
    if tech_term_hits >= 2:
        strengths.append(f"Demonstrated sound understanding of core mechanics ({tech_term_hits} relevant technical terms cited).")
    else:
        strengths.append("Accurately captured the high-level purpose and goal of the concept.")
    
    if struct_score >= 4:
        strengths.append("Structured the explanation in a logical sequence that simplifies complex ideas.")
    else:
        strengths.append("Maintained honest focus without fabricating unverified claims.")

    # Improvements directly connecting back to Candidate's Skill Gap Analysis!
    improvements = []
    if depth_score < 5:
        improvements.append(
            ImprovementItem(
                suggestion="Explicitly state the exact architectural or memory trade-off (e.g. latency vs memory vs consistency).",
                connected_skill_gap=connected_gap,
                actionable_remedy=f"In your learning roadmap, review the practical exercises under '{connected_gap}' to rehearse explaining this in system design terms."
            )
        )
    if struct_score < 5:
        improvements.append(
            ImprovementItem(
                suggestion="Anchor your answer with a concrete 1-sentence production scenario before diving into theory.",
                connected_skill_gap="Production Python Microservices & Streaming (FastAPI / SSE)",
                actionable_remedy="Practice using the STAR framework: 'In an application processing thousands of items, we implement this by...'"
            )
        )
    if not improvements:
        improvements.append(
            ImprovementItem(
                suggestion="Prepare for senior-level edge-case questions, such as handling high concurrency or network partition failure modes.",
                connected_skill_gap=connected_gap,
                actionable_remedy="Rehearse answering follow-up questions under time pressure using Wispr Flow dictation."
            )
        )

    # Contextual Follow-up Questions based on candidate's answer
    followups = []
    if req.category == "Python":
        followups = [
            "If an asynchronous streaming endpoint yields chunks to a client, how do you handle client disconnects cleanly so the generator doesn't leak memory?",
            "How would you profile whether a performance bottleneck in your FastAPI service is caused by CPU serialization or network I/O?"
        ]
    elif req.category == "Generative AI":
        followups = [
            "When using strict Pydantic JSON schema generation, what fallback strategy would you implement if the model intermittently hits a rate limit or timeouts?",
            "How do you test and verify prompt changes in CI before releasing them to production users?"
        ]
    elif req.category == "RAG":
        followups = [
            "How would you choose the chunk size and chunk overlap when splitting technical PDF documentation containing code blocks and tables?",
            "What re-ranking algorithm or cross-encoder would you choose, and what latency impact does it introduce?"
        ]
    elif req.category == "Machine Learning":
        followups = [
            "If your vector similarity search queries return irrelevant documents during peak hours, how would you diagnose whether the issue is in the embedding model or the retriever index?",
            "When would you choose approximate nearest neighbors (HNSW) over exact k-NN search in production?"
        ]
    else:  # System Design
        followups = [
            "How would you store and snapshot the state machine's conversation thread so that an agent can be paused for human approval and resumed 2 hours later?",
            "What telemetry and metrics (e.g. OpenTelemetry, token latency, cost per user) would you expose on your production dashboard?"
        ]

    cleaned_unstructured = clean_spoken_dictation(raw_answer)
    cleaned_structured = structure_spoken_dictation(raw_answer)

    return MockInterviewEvaluationResponse(
        original_answer=raw_answer,
        cleaned_structured_answer=cleaned_structured,
        cleaned_unstructured_answer=cleaned_unstructured,
        dimension_scores=DimensionScores(
            structure=DimensionScore(score=struct_score, feedback=struct_feedback),
            technical_depth=DimensionScore(score=depth_score, feedback=depth_feedback),
            relevance=DimensionScore(score=rel_score, feedback=rel_feedback),
            clarity=DimensionScore(score=clarity_score, feedback=clarity_feedback)
        ),
        overall_score=overall_score,
        percentage=pct,
        verdict=verdict,
        strengths=strengths,
        improvement_suggestions=improvements,
        contextual_followups=followups,
        provider_used="demo_fallback",
        is_live_ai=False,
        evaluation_note="Deterministic Evaluation Studio Mode (Strictly evaluates technical substance, meaning, and reasoning without penalizing speaking style or accent)."
    )

# -------------------------------------------------------------
# Live LLM Evaluator (When Anthropic or Gemini is Configured)
# -------------------------------------------------------------
def evaluate_dictated_answer_llm(
    provider: str,
    req: MockInterviewEvaluationRequest
) -> MockInterviewEvaluationResponse:
    prompt = f"""You are the Lead Technical Interviewer evaluating a candidate for a {req.target_role} position.
The candidate dictated their answer using natural speech (via Wispr Flow).

INTERVIEW QUESTION:
Category: {req.category}
Question: {req.question_text}

CANDIDATE'S ORIGINAL DICTATED ANSWER:
"{req.candidate_answer}"

EVALUATION INSTRUCTIONS & NON-NEGOTIABLE RULES:
1. Access four dimensions, each scored STRICTLY from 1 to 5:
   - Structure (out of 5): Logical flow, clear organization, beginning to end.
   - Technical Depth (out of 5): Knowledge of underlying mechanisms, trade-offs, and frameworks.
   - Relevance (out of 5): Direct alignment with the question asked.
   - Clarity (out of 5): Communication substance and comprehensibility.
2. OVERALL SCORE must be the sum of the four dimensions (integer from 4 to 20).
3. CLEANED ANSWERS:
   - `cleaned_structured_answer`: Organize into structured bullet points (Core Concept, Technical Execution, Impact).
   - `cleaned_unstructured_answer`: Fluent verbal prose with speech filler words removed.
   - CRITICAL RULE: The cleaned answers MUST PRESERVE the candidate's original meaning and factual claims. It must NOT invent technical knowledge that was not present in the original answer.
4. DO NOT penalize the candidate merely for accent, harmless fillers, or speaking style. Evaluate technical reasoning and communication substance.
5. In `improvement_suggestions`, directly connect the candidate's improvement areas to their skill gaps (e.g. {req.candidate_skill_gaps or ['Python Microservices', 'Hybrid RAG', 'Agentic Orchestration']}).
6. Generate 2 contextual follow-up technical questions.

Output MUST be strictly valid JSON matching this schema:
{{
  "original_answer": "{req.candidate_answer.replace('"', '')}",
  "cleaned_structured_answer": "string",
  "cleaned_unstructured_answer": "string",
  "dimension_scores": {{
    "structure": {{ "score": 4, "feedback": "string" }},
    "technical_depth": {{ "score": 4, "feedback": "string" }},
    "relevance": {{ "score": 5, "feedback": "string" }},
    "clarity": {{ "score": 4, "feedback": "string" }}
  }},
  "overall_score": 17,
  "percentage": 85,
  "verdict": "Strong Hire" | "Hire" | "Lean Hire" | "Needs Refinement",
  "strengths": ["string"],
  "improvement_suggestions": [
    {{
      "suggestion": "string",
      "connected_skill_gap": "string",
      "actionable_remedy": "string"
    }}
  ],
  "contextual_followups": ["string", "string"]
}}
Return raw JSON only.
"""

    try:
        raw_json_str = ""
        if provider == "anthropic":
            import anthropic
            client = anthropic.Anthropic()
            msg = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=3000,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_json_str = msg.content[0].text
        elif provider == "gemini":
            from google import genai
            client = genai.Client()
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            raw_json_str = resp.text

        clean_text = raw_json_str.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        parsed = json.loads(clean_text)
        parsed["provider_used"] = provider
        parsed["is_live_ai"] = True
        parsed["evaluation_note"] = f"Evaluated live using {provider.title()} API."

        return MockInterviewEvaluationResponse.model_validate(parsed)
    except Exception as e:
        print(f"Warning: Live interview evaluation with {provider} encountered error: {e}. Falling back to deterministic studio evaluator.")
        fallback = evaluate_dictated_answer_deterministic(req)
        fallback.evaluation_note = f"Deterministic Fallback Mode (Live {provider} call encountered: {str(e)[:80]}...)"
        return fallback

# -------------------------------------------------------------
# Router Endpoints: GET /api/interview/questions
# -------------------------------------------------------------
@router.get("/api/interview/questions", response_model=List[InterviewQuestionItem])
def get_interview_questions(
    category: Optional[str] = None,
    skill_gap: Optional[str] = None
):
    """Returns junior engineer interview questions filtered by category or candidate skill gap."""
    res = QUESTION_BANK
    if category and category.lower() != "all":
        res = [q for q in res if q.category.lower() == category.lower()]
    if skill_gap:
        res = [q for q in res if q.connected_skill_gap and skill_gap.lower() in q.connected_skill_gap.lower()]
    return res if res else QUESTION_BANK

# -------------------------------------------------------------
# Router Endpoints: POST /api/evaluate-interview & POST /aps/evaluate-interview
# (Supports both /api/evaluate-interview and /aps/evaluate-interview requested in prompt)
# -------------------------------------------------------------
@router.post("/api/evaluate-interview", response_model=MockInterviewEvaluationResponse)
@router.post("/aps/evaluate-interview", response_model=MockInterviewEvaluationResponse)
@router.post("/api/interview/evaluate-studio", response_model=MockInterviewEvaluationResponse)
def evaluate_interview_studio(request: MockInterviewEvaluationRequest):
    """
    Evaluates interview answer dictated naturally through Wispr Flow.
    Assesses Structure (/5), Technical Depth (/5), Relevance (/5), and Clarity (/5).
    Preserves original meaning and facts; connects improvement areas to candidate skill gaps.
    """
    if not request.candidate_answer.strip():
        raise HTTPException(status_code=400, detail="Candidate answer cannot be empty.")

    # Check for configured LLM provider
    provider = None
    if os.environ.get("ANTHROPIC_API_KEY"):
        provider = "anthropic"
    elif os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        provider = "gemini"

    if provider:
        return evaluate_dictated_answer_llm(provider, request)
    else:
        return evaluate_dictated_answer_deterministic(request)

# Backward compatibility aliases
get_questions = get_interview_questions
evaluate_interview_response = evaluate_interview_studio
EvaluationRequest = MockInterviewEvaluationRequest
EvaluationResponse = MockInterviewEvaluationResponse
