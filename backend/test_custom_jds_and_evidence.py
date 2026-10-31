import os
import pytest
from backend.routers.career_intelligence import (
    CandidateProfileInput,
    JobDescriptionInput,
    CareerAnalysisRequest,
    analyze_career,
    get_demo_data,
    extract_resume_evidence,
    run_deterministic_analysis
)
from backend.routers.applications import SAMPLE_APPLICATIONS

def test_unrelated_custom_jds_dynamic_sources():
    """
    Correction 3 Requirement:
    Verify that when 3 unrelated custom companies and requirements are supplied,
    skill frequencies and job sources are derived dynamically and reflect ONLY the supplied JDs.
    """
    custom_resume = """JANE DOE
Frontend and Cloud Developer
Experience:
- Built web dashboards using React, TypeScript, and Docker containers.
- Collaborated with teams on GitHub Actions CI/CD deployment pipelines.
- Integrated RESTful backend endpoints in Node.js.
Skills: TypeScript, React, Docker, GitHub Actions, Node.js, HTML, CSS.
"""
    custom_candidate = CandidateProfileInput(
        candidate_name="Jane Doe",
        target_role="Generative AI Platform Engineer",
        current_role="Frontend and Cloud Developer",
        years_experience=4,
        resume_text=custom_resume
    )

    custom_jds = [
        JobDescriptionInput(
            company_name="Acme Biotech Labs",
            job_title="Bioinformatics Agentic Systems Engineer",
            source_url="https://acmebiotech.example.com/jobs/101",
            posting_date="Illustrative Custom Posting 1",
            description_text="Building multi-agent state machines and LangGraph agentic workflows for molecular docking workflows."
        ),
        JobDescriptionInput(
            company_name="Quantum Robotics",
            job_title="Autonomous Agent Architect",
            source_url="https://quantumrobotics.example.com/jobs/202",
            posting_date="Illustrative Custom Posting 2",
            description_text="Seeking an engineer to author LangGraph multi-agent loops and containerized microservices in Docker."
        ),
        JobDescriptionInput(
            company_name="SolarGrid Energy",
            job_title="AI Dispatch Systems Engineer",
            source_url="https://solargrid.example.com/jobs/303",
            posting_date="Illustrative Custom Posting 3",
            description_text="Design smart energy dispatch agents with strict JSON schema tool validation and Docker containers."
        )
    ]

    req = CareerAnalysisRequest(candidate=custom_candidate, job_descriptions=custom_jds)
    result = analyze_career(req)

    assert result.summary.total_skills_analyzed > 0

    # Check that job sources strictly contain the custom companies and NEVER the default ones
    found_custom_companies = set()
    forbidden_defaults = {"Anthropic", "Cohere", "Databricks"}

    for skill in result.skills_required:
        assert skill.frequency_total == 3
        for source in skill.job_sources:
            for forbidden in forbidden_defaults:
                assert forbidden not in source, f"Hardcoded default company '{forbidden}' found in dynamic job source: {source}"
            if "Acme Biotech Labs" in source:
                found_custom_companies.add("Acme Biotech Labs")
            if "Quantum Robotics" in source:
                found_custom_companies.add("Quantum Robotics")
            if "SolarGrid Energy" in source:
                found_custom_companies.add("SolarGrid Energy")

    assert "Acme Biotech Labs" in found_custom_companies
    assert "Quantum Robotics" in found_custom_companies
    assert "SolarGrid Energy" in found_custom_companies
    print("[PASS] 3 Unrelated custom JDs dynamically matched and verified; zero hardcoded default companies found.")

def test_resume_evidence_accuracy_and_no_fabrication():
    """
    Correction 2 Requirement:
    Never generate a prewritten resume quotation unless that exact text exists in the supplied resume.
    If no supporting quotation exists, return: 'No explicit evidence found in the supplied resume.'
    """
    sparse_resume = """JOHN SMITH
Database Administrator
Managed SQL Server databases, wrote T-SQL queries, and performed daily backups.
Skills: SQL, T-SQL, Database Administration, Backup Management.
"""
    candidate = CandidateProfileInput(
        candidate_name="John Smith",
        target_role="Gen AI Engineer",
        current_role="Database Administrator",
        years_experience=6,
        resume_text=sparse_resume
    )

    demo = get_demo_data()
    req = CareerAnalysisRequest(
        candidate=candidate,
        job_descriptions=[JobDescriptionInput(**jd) for jd in demo["job_descriptions"]]
    )
    result = analyze_career(req)

    for skill in result.skills_required:
        if skill.candidate_status == "not evidenced in the resume":
            assert skill.resume_evidence == "No explicit evidence found in the supplied resume.", (
                f"Expected exact missing message, got: {skill.resume_evidence}"
            )
        else:
            # If demonstrated or partially demonstrated, quotation MUST be verbatim in sparse_resume
            assert skill.resume_evidence in sparse_resume, (
                f"Quotation '{skill.resume_evidence}' not found verbatim in candidate resume!"
            )
            # Must not fabricate technologies not in sparse_resume
            assert "LangGraph" not in skill.resume_evidence
            assert "FastAPI" not in skill.resume_evidence
            assert "Docker" not in skill.resume_evidence

    print("[PASS] Resume evidence accuracy verified: 100% verbatim substring or exact unevidenced disclaimer.")

def test_databricks_job_title_consistency():
    """
    Correction 3 Requirement:
    Fix Databricks job title inconsistency to 'Staff Generative AI Applications Engineer'.
    """
    demo = get_demo_data()
    databricks_jds = [jd for jd in demo["job_descriptions"] if jd["company_name"] == "Databricks"]
    assert len(databricks_jds) == 1
    assert databricks_jds[0]["job_title"] == "Staff Generative AI Applications Engineer"

    # Also check preloaded sample applications
    databricks_apps = [app for app in SAMPLE_APPLICATIONS if "Databricks" in app.company]
    assert len(databricks_apps) == 1
    assert databricks_apps[0].role == "Staff Generative AI Applications Engineer"
    print("[PASS] Databricks job title consistently matches 'Staff Generative AI Applications Engineer'.")

def test_live_ai_fallback_integrity():
    """
    Correction 1 & 7 Requirement:
    Ensure application never falsely reports live AI when using deterministic fallback.
    """
    demo = get_demo_data()
    req = CareerAnalysisRequest(
        candidate=CandidateProfileInput(**demo["candidate"]),
        job_descriptions=[JobDescriptionInput(**jd) for jd in demo["job_descriptions"]]
    )
    # When keys are absent or invalid, deterministic fallback must be is_live_ai=False
    fallback_res = run_deterministic_analysis(req.candidate, req.job_descriptions)
    assert fallback_res.summary.is_live_ai is False
    assert fallback_res.summary.provider_used == "demo_fallback"
    assert "Deterministic" in fallback_res.summary.provider_note
    assert "Fallback Mode" in fallback_res.summary.provider_note
    print("[PASS] Live AI fallback integrity verified: is_live_ai=False and provider_used='demo_fallback'.")

if __name__ == "__main__":
    test_unrelated_custom_jds_dynamic_sources()
    test_resume_evidence_accuracy_and_no_fabrication()
    test_databricks_job_title_consistency()
    test_live_ai_fallback_integrity()
    print("\n>>> ALL SUBMISSION-READINESS CORRECTION TESTS PASSED! <<<")
