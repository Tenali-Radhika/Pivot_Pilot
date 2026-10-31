from backend.routers import analyzer, roadmap, interview, applications

def test_analyzer():
    req = analyzer.ProfileAnalysisRequest()
    res = analyzer.analyze_profile(req)
    assert res.readiness.overall_score > 0
    print("[PASS] Analyzer returned readiness:", res.readiness.overall_score)

def test_roadmap():
    res = roadmap.get_roadmap("AI Solutions & Agentic Engineer")
    assert len(res.phases) == 4
    assert len(res.portfolio_projects) >= 3
    print("[PASS] Roadmap returned", len(res.phases), "phases and", len(res.portfolio_projects), "projects")

def test_interview():
    qs = interview.get_questions(None)
    assert len(qs) >= 4
    eval_req = interview.EvaluationRequest(
        question_id=qs[0].id,
        question_text=qs[0].question,
        category=qs[0].category,
        candidate_answer="In my previous role, I architected a LangGraph state machine with hybrid RAG and Pydantic validation, reducing review turnaround by 65%."
    )
    eval_res = interview.evaluate_interview_response(eval_req)
    assert eval_res.overall_score >= 10
    print("[PASS] Interview evaluation score:", eval_res.overall_score, "/ 20 | Verdict:", eval_res.verdict)

def test_applications():
    apps = applications.get_preset_applications()
    assert len(apps) >= 3
    pitch = applications.tailor_pitch(applications.PitchRequest(company="Anthropic Labs", role="AI Engineer"))
    assert "Anthropic" in pitch.elevator_pitch
    print("[PASS] Applications preset & elevator pitch generated successfully")

if __name__ == "__main__":
    test_analyzer()
    test_roadmap()
    test_interview()
    test_applications()
    print("ALL BACKEND MODULE TESTS PASSED!")

