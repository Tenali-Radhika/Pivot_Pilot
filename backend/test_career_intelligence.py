from backend.routers.career_intelligence import (
    CandidateProfileInput,
    JobDescriptionInput,
    CareerAnalysisRequest,
    analyze_career,
    get_demo_data
)

def test_career_intelligence_full_workflow():
    demo = get_demo_data()
    candidate_data = demo["candidate"]
    jds_data = demo["job_descriptions"]

    req = CareerAnalysisRequest(
        candidate=CandidateProfileInput(**candidate_data),
        job_descriptions=[JobDescriptionInput(**jd) for jd in jds_data]
    )

    print("[TEST] Running career analysis for target role:", req.candidate.target_role)
    res = analyze_career(req)

    # 1. Validate Target Role & Counts
    assert res.summary.target_role == "Gen AI Engineer"
    assert res.summary.total_skills_analyzed >= 6
    assert res.summary.cache_hit is False
    print(f"[PASS] Summary: Coverage Score={res.summary.overall_skill_coverage_score}%, Demonstrated={res.summary.demonstrated_count}, Partial={res.summary.partially_demonstrated_count}, Not Evidenced={res.summary.not_evidenced_count}")

    # 2. Validate Skills & Allowed Status Values
    allowed_statuses = {"demonstrated", "partially demonstrated", "not evidenced in the resume"}
    allowed_priorities = {"high", "medium", "low"}

    for skill in res.skills_required:
        assert skill.candidate_status in allowed_statuses, f"Invalid status: {skill.candidate_status}"
        assert skill.gap_priority in allowed_priorities, f"Invalid priority: {skill.gap_priority}"
        assert skill.frequency_count >= 1
        assert skill.frequency_total == len(jds_data)
        assert len(skill.job_sources) >= 1
        assert len(skill.resume_evidence) > 0

    print(f"[PASS] All {len(res.skills_required)} skills validated with strict Pydantic rules & status constraints.")

    # 3. Validate 3 Portfolio Project Recommendations directly connecting to gaps
    assert len(res.portfolio_projects) == 3, f"Expected 3 projects, got {len(res.portfolio_projects)}"
    for proj in res.portfolio_projects:
        assert len(proj.connected_skill_gaps) >= 1
        assert len(proj.architectural_highlights) >= 2
        assert len(proj.tech_stack) >= 2
        assert len(proj.copyable_resume_bullet) > 20
        assert len(proj.verification_criteria) > 10

    print("[PASS] 3 Portfolio projects verified with direct gap connections.")

    # 4. Validate 6-Week Roadmap with Weekly Objectives & Specific Tasks
    assert res.learning_roadmap.estimated_weeks == 6
    assert len(res.learning_roadmap.weeks) == 6
    for week in res.learning_roadmap.weeks:
        assert len(week.tasks) >= 2
        for task in week.tasks:
            assert len(task.skill_association) > 3
            assert task.completed is False
    print(f"[PASS] 6-Week Learning Roadmap validated: 6 weekly objectives, {sum(len(w.tasks) for w in res.learning_roadmap.weeks)} tasks with skill associations.")

    # 5. Validate Caching
    res_cached = analyze_career(req)
    assert res_cached.summary.cache_hit is True, "Second call should result in cache_hit=True"
    print("[PASS] Cache hit confirmed on repeated request with identical hash.")

    print("\n>>> ALL CAREER INTELLIGENCE MODULE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_career_intelligence_full_workflow()

