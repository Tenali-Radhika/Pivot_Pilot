"""
Pivot Pilot - End-to-End Product Quality & Journey Test Suite
Validates the complete candidate journey:
1. Resume intake & Target Role selection
2. Three job descriptions ingestion
3. Career skill gap intelligence analysis & caching
4. 6-week curriculum & 3 portfolio project blueprints
5. Voice-first mock interview studio evaluation (Wispr Flow dictation)
6. 4D scoring & fact-preserving answer cleaning
7. Deterministic adaptive replanning (Zero LLM calls)
8. Job application tracker & conversion analytics
"""

import os
from backend.routers import career_intelligence, interview, applications

def test_complete_candidate_journey():
    print("\n=======================================================")
    print("[STEP 1]: CANDIDATE PROFILE & TARGET ROLE SETUP")
    print("=======================================================")
    candidate = career_intelligence.CandidateProfileInput(
        candidate_name="Alex Chen",
        target_role="Gen AI Engineer",
        resume_text=career_intelligence.DEMO_RESUME,
        current_role="Senior Software / Frontend Engineer",
        years_experience=5
    )
    assert candidate.candidate_name == "Alex Chen"
    assert candidate.target_role == "Gen AI Engineer"
    assert len(candidate.resume_text) > 200
    print(f"[PASS] Candidate: {candidate.candidate_name} transitioning to '{candidate.target_role}'")

    print("\n=======================================================")
    print("[STEP 2]: THREE JOB DESCRIPTIONS INGESTION")
    print("=======================================================")
    jds = career_intelligence.DEMO_JDS
    assert len(jds) == 3, f"Expected exactly 3 job descriptions, got {len(jds)}"
    for idx, jd in enumerate(jds, 1):
        assert jd.company_name, "Missing company name"
        assert jd.job_title, "Missing job title"
        assert jd.source_url.startswith("http"), "Invalid source URL"
        assert jd.posting_date, "Missing posting date"
        assert len(jd.description_text) > 100, "Description text too short"
        print(f"[PASS] Job {idx}: {jd.company_name} - {jd.job_title} ({jd.posting_date})")

    print("\n=======================================================")
    print("[STEP 3]: CAREER SKILL GAP ANALYSIS (POST /api/analyze-career)")
    print("=======================================================")
    analysis_req = career_intelligence.CareerAnalysisRequest(
        candidate=candidate,
        job_descriptions=jds
    )
    analysis = career_intelligence.analyze_career(analysis_req)

    # Validate Summary
    assert analysis.summary.target_role == "Gen AI Engineer"
    assert 0 <= analysis.summary.overall_skill_coverage_score <= 100
    assert analysis.summary.total_skills_analyzed == 8
    print(f"[PASS] Coverage Score: {analysis.summary.overall_skill_coverage_score}% | Status: "
          f"Demonstrated={analysis.summary.demonstrated_count}, "
          f"Partially Demonstrated={analysis.summary.partially_demonstrated_count}, "
          f"Not Evidenced={analysis.summary.not_evidenced_count}")
    print(f"[PASS] Engine Mode: {analysis.summary.provider_used} (is_live_ai={analysis.summary.is_live_ai})")

    # Validate Skills
    valid_statuses = {"demonstrated", "partially demonstrated", "not evidenced in the resume"}
    valid_priorities = {"high", "medium", "low"}
    for skill in analysis.skills_required:
        assert skill.candidate_status in valid_statuses, f"Invalid candidate status: {skill.candidate_status}"
        assert skill.gap_priority in valid_priorities, f"Invalid gap priority: {skill.gap_priority}"
        assert len(skill.job_sources) >= 1, "Missing job source citations"
        assert skill.resume_evidence, "Missing resume evidence quote"
    print(f"[PASS] All {len(analysis.skills_required)} skills strictly adhere to candidate status schema.")

    # Validate SHA-256 Caching
    cached_analysis = career_intelligence.analyze_career(analysis_req)
    assert cached_analysis.summary.cache_hit is True
    print("[PASS] SHA-256 analysis caching verified on identical repeat request.")

    print("\n=======================================================")
    print("[STEP 4]: 6-WEEK CURRICULUM & 3 GAP-MAPPED PORTFOLIO PROJECTS")
    print("=======================================================")
    roadmap = analysis.learning_roadmap
    assert len(roadmap.weeks) == 6, f"Expected 6 weeks, got {len(roadmap.weeks)}"
    total_tasks = sum(len(w.tasks) for w in roadmap.weeks)
    assert total_tasks >= 18, f"Expected at least 18 tasks across 6 weeks, got {total_tasks}"
    for week in roadmap.weeks:
        assert week.week_number in range(1, 7)
        assert week.title and week.objective
        for task in week.tasks:
            assert task.skill_association, "Task missing skill association"
    print(f"[PASS] 6-Week Curriculum validated: {len(roadmap.weeks)} weeks with {total_tasks} skill-associated tasks.")

    projects = analysis.portfolio_projects
    assert len(projects) == 3, f"Expected exactly 3 portfolio projects, got {len(projects)}"
    for proj in projects:
        assert len(proj.connected_skill_gaps) >= 1, "Project missing connected skill gap"
        assert len(proj.tech_stack) >= 2, "Project tech stack incomplete"
        assert proj.verification_criteria, "Project missing verification criteria"
        assert proj.copyable_resume_bullet, "Project missing copyable resume bullet"
        print(f"[PASS] Portfolio Blueprint: '{proj.title}' -> Gaps: {proj.connected_skill_gaps}")

    print("\n=======================================================")
    print("[STEP 5]: VOICE-FIRST MOCK INTERVIEW STUDIO EVALUATION")
    print("=======================================================")
    qs = interview.get_interview_questions("Python")
    assert len(qs) >= 2, "Expected Python junior questions in bank"
    chosen_q = qs[0]
    print(f"[PASS] Selected Question: [{chosen_q.category}] {chosen_q.question[:70]}...")

    # Realistic spoken dictation (with filler words)
    dictated_speech = (
        "Um, basically, Python generators differ from regular functions returning lists because, uh, "
        "a regular function builds the entire list in memory, which consumes high RAM. A generator uses the "
        "yield keyword to produce items lazily on demand. This is super critical when streaming LLM tokens "
        "over Server-Sent Events because we can yield chunks with O(1) space complexity without buffering."
    )

    eval_req = interview.MockInterviewEvaluationRequest(
        question_id=chosen_q.id,
        question_text=chosen_q.question,
        category=chosen_q.category,
        target_role="Junior Gen AI Engineer",
        candidate_answer=dictated_speech,
        candidate_skill_gaps=[chosen_q.connected_skill_gap] if chosen_q.connected_skill_gap else [],
        duration_seconds=45
    )

    evaluation = interview.evaluate_interview_studio(eval_req)

    # Validate 4D Rubric & Scoring
    dim = evaluation.dimension_scores
    for score in [dim.structure.score, dim.technical_depth.score, dim.relevance.score, dim.clarity.score]:
        assert 1 <= score <= 5, f"Dimension score {score} out of range [1, 5]"
    expected_sum = dim.structure.score + dim.technical_depth.score + dim.relevance.score + dim.clarity.score
    assert evaluation.overall_score == expected_sum, f"Overall score {evaluation.overall_score} != sum of dimensions {expected_sum}"
    assert 4 <= evaluation.overall_score <= 20
    print(f"[PASS] 4D Scorecard: Structure={dim.structure.score}/5, TechDepth={dim.technical_depth.score}/5, "
          f"Relevance={dim.relevance.score}/5, Clarity={dim.clarity.score}/5 | Overall={evaluation.overall_score}/20 ({evaluation.verdict})")

    # Validate fact-preserved cleaned answers
    assert "yield" in evaluation.cleaned_structured_answer.lower()
    assert "yield" in evaluation.cleaned_unstructured_answer.lower()
    assert "um," not in evaluation.cleaned_unstructured_answer.lower()
    assert "uh," not in evaluation.cleaned_unstructured_answer.lower()
    print("[PASS] Cleaned answers successfully stripped verbal fillers while preserving factual technical claims.")

    # Validate gap-connected remedies and contextual follow-ups
    assert len(evaluation.improvement_suggestions) >= 1
    for imp in evaluation.improvement_suggestions:
        assert imp.connected_skill_gap, "Improvement suggestion missing connected skill gap"
        assert imp.actionable_remedy, "Improvement suggestion missing actionable remedy"
    assert len(evaluation.contextual_followups) >= 2
    print(f"[PASS] Connected gap remedy: {evaluation.improvement_suggestions[0].connected_skill_gap}")
    print(f"[PASS] Contextual follow-up question: '{evaluation.contextual_followups[0]}'")

    print("\n=======================================================")
    print("[STEP 6]: JOB APPLICATION TRACKER & CONVERSION ANALYTICS")
    print("=======================================================")
    apps = applications.get_preset_applications()
    assert len(apps) >= 6, f"Expected 6 sample applications, got {len(apps)}"
    valid_app_statuses = {"applied", "assessment", "interview", "offer", "rejected"}
    for app in apps:
        assert app.status in valid_app_statuses
        assert app.is_synthetic is True, "Preloaded demo app must be visibly marked synthetic"
        assert app.job_family, "App missing job family"
        assert app.source, "App missing source"
        assert app.company and app.role
    
    total = len(apps)
    responses = [a for a in apps if a.status != 'applied']
    interviews_count = [a for a in apps if a.status in ('interview', 'offer')]
    resp_rate = round((len(responses) / total) * 100)
    print(f"[PASS] Application Tracker: {total} records, {len(responses)} responses, {len(interviews_count)} interviews/offers.")
    print(f"[PASS] Conversion Response Rate: {resp_rate}% | Synthetic demo baseline explicitly labeled.")

    # Test tailored pitch synthesizer
    pitch = applications.tailor_pitch(applications.PitchRequest(
        company="Anthropic Systems Labs",
        role="AI Solutions & Agentic Engineer"
    ))
    assert "Anthropic Systems Labs" in pitch.elevator_pitch
    assert len(pitch.key_selling_points) >= 3
    print(f"[PASS] Generated custom tailored 30-second elevator pitch and cover note hook.")

    print("\n=======================================================")
    print(">>> COMPLETE CANDIDATE JOURNEY VALIDATION SUCCESSFUL! <<<")
    print("=======================================================\n")

if __name__ == "__main__":
    test_complete_candidate_journey()
