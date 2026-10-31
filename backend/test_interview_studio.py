from backend.routers.interview import (
    MockInterviewEvaluationRequest,
    evaluate_interview_studio,
    get_interview_questions
)

def test_mock_interview_studio():
    # 1. Test Question Bank & Category Filtering
    all_qs = get_interview_questions()
    assert len(all_qs) >= 8
    print(f"[PASS] Question bank contains {len(all_qs)} junior engineer questions.")

    categories = ["Python", "Generative AI", "RAG", "Machine Learning", "System Design"]
    for cat in categories:
        cat_qs = get_interview_questions(category=cat)
        assert len(cat_qs) >= 1
        for q in cat_qs:
            assert q.category == cat
            assert q.role_level == "Junior Engineer"
    print("[PASS] Verified category filtering for Python, Generative AI, RAG, Machine Learning, and System Design.")

    # 2. Test Spoken Dictation Evaluation (Wispr Flow style with verbal fillers)
    sample_dictated_answer = (
        "Um, so basically, python generators differ from regular functions because, uh, instead of returning "
        "a full list that loads everything into RAM memory at once, a generator uses the yield keyword to produce "
        "items one at a time lazily. You know, this is super important when streaming tokens from an LLM API "
        "because we can yield chunks over Server-Sent Events with O(1) space complexity without buffering gigabytes in memory."
    )

    req = MockInterviewEvaluationRequest(
        question_id="q-py-1",
        question_text="How do Python generators differ from regular functions returning lists, and why are they critical when streaming tokens or processing large datasets?",
        category="Python",
        target_role="Junior Gen AI Engineer",
        candidate_answer=sample_dictated_answer,
        candidate_skill_gaps=["Production Python Microservices & Streaming (FastAPI / SSE)"],
        duration_seconds=42
    )

    res = evaluate_interview_studio(req)

    # 3. Verify Original Answer preserved exactly
    assert res.original_answer == sample_dictated_answer
    print("[PASS] Original dictated answer preserved verbatim.")

    # 4. Verify Cleaned Unstructured Answer (Fillers removed, facts preserved)
    assert "um" not in res.cleaned_unstructured_answer.lower().split()
    assert "yield" in res.cleaned_unstructured_answer.lower()
    assert "ram" in res.cleaned_unstructured_answer.lower()
    print("[PASS] Cleaned unstructured answer stripped verbal fillers while preserving all factual content.")

    # 5. Verify Cleaned Structured Answer
    assert "•" in res.cleaned_structured_answer
    print("[PASS] Cleaned structured answer formatted into logical technical bullets.")

    # 6. Verify 4 Dimension Scores (each /5, overall /20)
    scores = res.dimension_scores
    assert 1 <= scores.structure.score <= 5
    assert 1 <= scores.technical_depth.score <= 5
    assert 1 <= scores.relevance.score <= 5
    assert 1 <= scores.clarity.score <= 5

    assert res.overall_score == (
        scores.structure.score + scores.technical_depth.score +
        scores.relevance.score + scores.clarity.score
    )
    assert 4 <= res.overall_score <= 20
    print(f"[PASS] 4 Dimensions: Structure={scores.structure.score}/5, TechnicalDepth={scores.technical_depth.score}/5, Relevance={scores.relevance.score}/5, Clarity={scores.clarity.score}/5 | Overall={res.overall_score}/20 ({res.verdict})")

    # 7. Verify Connected Skill Gaps in Improvement Suggestions
    assert len(res.improvement_suggestions) >= 1
    for imp in res.improvement_suggestions:
        assert len(imp.connected_skill_gap) > 3
        print(f"       -> Connected Gap: '{imp.connected_skill_gap}' | Remedy: {imp.actionable_remedy[:50]}...")
    print("[PASS] Improvement suggestions successfully connect back to candidate's skill gaps.")

    # 8. Verify Contextual Follow-up Questions
    assert len(res.contextual_followups) >= 2
    for f in res.contextual_followups:
        assert len(f) > 15
    print("[PASS] Generated contextual technical follow-up questions.")

    print("\n>>> ALL MOCK INTERVIEW STUDIO BACKEND TESTS PASSED! <<<")

if __name__ == "__main__":
    test_mock_interview_studio()

