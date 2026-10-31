import pytest
from backend.routers.applications import get_preset_applications, tailor_pitch, PitchRequest

def test_preset_applications_schema():
    apps = get_preset_applications()
    assert len(apps) >= 6, f"Expected at least 6 sample applications, got {len(apps)}"
    
    valid_statuses = {"applied", "assessment", "interview", "offer", "rejected"}
    
    for app in apps:
        assert app.company, "Application must contain company name"
        assert app.role, "Application must contain job title (role)"
        assert app.job_family, "Application must contain job family"
        assert app.date_applied, "Application must contain application date"
        assert app.source, "Application must contain application source"
        assert app.status in valid_statuses, f"Invalid status: {app.status}"
        assert app.is_synthetic is True, "Preloaded application must be visibly marked as synthetic demo data"
        
    print(f"[PASS] All {len(apps)} preset applications validated against schema & synthetic marking.")

def test_analytics_computation():
    apps = get_preset_applications()
    total = len(apps)
    responses = [a for a in apps if a.status != 'applied']
    interviews = [a for a in apps if a.status in ('interview', 'offer')]
    offers = [a for a in apps if a.status == 'offer']
    response_rate = round((len(responses) / total) * 100)
    
    assert total >= 6
    assert len(responses) >= 3
    assert len(interviews) >= 2
    assert response_rate > 50
    
    # Check job family breakdown
    families = set(a.job_family for a in apps)
    assert len(families) >= 3, f"Expected multiple job families, got {families}"
    
    print(f"[PASS] Analytics verified: Total={total}, Responses={len(responses)}, Interviews={len(interviews)}, Offers={len(offers)}, ResponseRate={response_rate}%")
    print(f"[PASS] Job families represented: {list(families)}")

def test_tailored_pitch():
    req = PitchRequest(
        company="Anthropic Systems Labs",
        role="AI Solutions & Agentic Engineer"
    )
    res = tailor_pitch(req)
    assert "Anthropic Systems Labs" in res.elevator_pitch
    assert len(res.key_selling_points) >= 3
    assert len(res.cover_note_hook) > 20
    print("[PASS] Pitch generation returned tailored elevator pitch and cover note hook.")

if __name__ == "__main__":
    test_preset_applications_schema()
    test_analytics_computation()
    test_tailored_pitch()
    print("\n>>> ALL APPLICATION TRACKER TESTS PASSED SUCCESSFULLY! <<<")

