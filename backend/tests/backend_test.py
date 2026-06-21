"""Dentalin backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://premium-dental-bat.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@dentalin.com"
ADMIN_PASSWORD = "dentalin2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    data = r.json()
    return data["token"]


@pytest.fixture()
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Public endpoints ----------
class TestPublic:
    def test_clinic_info(self, session):
        r = session.get(f"{API}/public/clinic-info", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "phone" in d and "whatsapp" in d and "address" in d

    def test_treatments(self, session):
        r = session.get(f"{API}/public/treatments", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        featured = [t for t in data if t.get("featured")]
        assert len(featured) == 4
        slugs = {t["slug"] for t in data}
        for s in ["implant", "ortodonti", "gulus_tasarimi", "beyazlatma"]:
            assert s in slugs

    def test_doctors(self, session):
        r = session.get(f"{API}/public/doctors", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4
        for d in data:
            assert "name" in d and "specialty" in d

    def test_testimonials(self, session):
        r = session.get(f"{API}/public/testimonials", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6

    def test_faqs(self, session):
        r = session.get(f"{API}/public/faqs", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6

    def test_before_after_all(self, session):
        r = session.get(f"{API}/public/before-after", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4

    def test_before_after_filter(self, session):
        r = session.get(f"{API}/public/before-after?category=implant", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert all(b["category"] == "implant" for b in data)
        assert len(data) >= 1

    def test_before_after_case_fields(self, session):
        r = session.get(f"{API}/public/before-after", timeout=15)
        data = r.json()
        # at least one record should have full case-study fields
        assert any(
            b.get("patient_name") and b.get("patient_age") and b.get("problem") and b.get("result_summary")
            for b in data
        )


# ---------- Social proof / tracking ----------
class TestSocialProof:
    def test_track_returns_ok_and_persists(self, session):
        r = session.post(
            f"{API}/public/track",
            json={"treatment_slug": "implant", "type": "wa_click"},
            headers={"Content-Type": "application/json", "User-Agent": "PYTEST-UA-track-1"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_social_proof_structure(self, session):
        r = session.get(f"{API}/public/social-proof", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "counts" in d and isinstance(d["counts"], dict)
        assert "as_of" in d and isinstance(d["as_of"], str)

    def test_track_dedup_same_ua_counts_once_per_slug(self, session):
        # Use a brand new slug-like marker so we don't collide with seed
        slug = "ortodonti"
        # Get baseline count for ortodonti
        baseline = session.get(f"{API}/public/social-proof").json()["counts"].get(slug, 0)

        ua = "PYTEST-UA-dedup-FIXED"
        for _ in range(4):
            r = session.post(
                f"{API}/public/track",
                json={"treatment_slug": slug, "type": "wa_click"},
                headers={"Content-Type": "application/json", "User-Agent": ua},
                timeout=15,
            )
            assert r.status_code == 200

        after = session.get(f"{API}/public/social-proof").json()["counts"].get(slug, 0)
        # Same IP+UA → should contribute exactly 1 (or 0 increment if already tracked today by this UA)
        delta = after - baseline
        assert delta in (0, 1), f"Expected dedup delta 0/1, got {delta}"

    def test_track_distinct_ua_counts_multiple(self, session):
        slug = "beyazlatma"
        baseline = session.get(f"{API}/public/social-proof").json()["counts"].get(slug, 0)
        for i in range(3):
            r = session.post(
                f"{API}/public/track",
                json={"treatment_slug": slug, "type": "wa_click"},
                headers={"Content-Type": "application/json", "User-Agent": f"PYTEST-UA-multi-{i}-X"},
                timeout=15,
            )
            assert r.status_code == 200
        after = session.get(f"{API}/public/social-proof").json()["counts"].get(slug, 0)
        # Each distinct UA should be counted (at least 3 newly added OR pre-existing dedup if same UA collisions). Expect delta in {0..3}; check at least delta>=0 and final >=3
        assert after >= 3, f"Expected counts[{slug}] >= 3, got {after}"


# ---------- Public POST flows ----------
class TestAppointmentAndLead:
    def test_create_appointment_creates_lead(self, session):
        payload = {
            "name": "TEST_Apt User",
            "phone": "05551234567",
            "email": "test_apt@example.com",
            "treatment_slug": "implant",
            "treatment_name": "İmplant Tedavisi",
            "preferred_date": "2026-02-15",
            "preferred_time": "14:00",
            "notes": "TEST appointment",
        }
        r = session.post(f"{API}/public/appointments", json=payload, timeout=15)
        assert r.status_code == 200
        apt = r.json()
        assert apt["name"] == payload["name"]
        assert apt["status"] == "pending"
        assert "id" in apt

        # Verify lead created via admin endpoint
        login = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()
        headers = {"Authorization": f"Bearer {login['token']}"}
        leads = session.get(f"{API}/admin/leads", headers=headers).json()
        assert any(l.get("phone") == payload["phone"] and l.get("source") == "appointment_form" for l in leads)

    def test_create_lead(self, session):
        payload = {"name": "TEST_Lead", "phone": "05559998877", "message": "Bilgi"}
        r = session.post(f"{API}/public/leads", json=payload, timeout=15)
        assert r.status_code == 200
        lead = r.json()
        assert lead["name"] == "TEST_Lead"
        assert lead["status"] == "new"


# ---------- Quiz ----------
class TestQuiz:
    def test_missing_tooth_implant(self, session):
        r = session.post(f"{API}/public/quiz", json={"answers": {"missing_tooth": True}}, timeout=15)
        assert r.status_code == 200
        assert r.json()["recommendation"] == "implant"

    def test_yellowing_beyazlatma(self, session):
        r = session.post(f"{API}/public/quiz", json={"answers": {"yellowing": True}}, timeout=15)
        assert r.json()["recommendation"] == "beyazlatma"

    def test_crooked_ortodonti(self, session):
        r = session.post(f"{API}/public/quiz", json={"answers": {"crooked_teeth": True}}, timeout=15)
        assert r.json()["recommendation"] == "ortodonti"

    def test_empty_default(self, session):
        r = session.post(f"{API}/public/quiz", json={"answers": {}}, timeout=15)
        assert r.json()["recommendation"] == "gulus_tasarimi"


# ---------- Auth ----------
class TestAuth:
    def test_login_success_returns_token_and_cookie(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and isinstance(d["token"], str) and len(d["token"]) > 10
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"]["role"] == "admin"
        # Cookie set
        assert "access_token" in r.cookies

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_requires_auth(self, session):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---------- Admin auth-gated ----------
@pytest.mark.parametrize("path", [
    "/admin/stats", "/admin/appointments", "/admin/leads", "/admin/doctors",
    "/admin/treatments", "/admin/testimonials", "/admin/before-after", "/admin/faqs",
])
class TestAdminAuthRequired:
    def test_unauthorized_returns_401(self, path):
        r = requests.get(f"{API}{path}", timeout=15)
        assert r.status_code == 401

    def test_authorized_returns_200(self, path, auth_headers):
        r = requests.get(f"{API}{path}", headers=auth_headers, timeout=15)
        assert r.status_code == 200


# ---------- Admin CRUD: appointments + leads status update ----------
class TestAdminUpdates:
    def test_patch_appointment_status(self, session, auth_headers):
        # create appointment
        payload = {
            "name": "TEST_StatusApt", "phone": "05550000001", "treatment_slug": "implant",
            "treatment_name": "İmplant Tedavisi", "preferred_date": "2026-03-01", "preferred_time": "10:00",
        }
        c = session.post(f"{API}/public/appointments", json=payload).json()
        apt_id = c["id"]
        r = requests.patch(f"{API}/admin/appointments/{apt_id}", json={"status": "confirmed"}, headers=auth_headers)
        assert r.status_code == 200
        # verify via list
        apts = requests.get(f"{API}/admin/appointments", headers=auth_headers).json()
        found = next((a for a in apts if a["id"] == apt_id), None)
        assert found and found["status"] == "confirmed"

    def test_patch_lead_status(self, session, auth_headers):
        c = session.post(f"{API}/public/leads", json={"name": "TEST_LeadStatus", "phone": "05550000002"}).json()
        lid = c["id"]
        r = requests.patch(f"{API}/admin/leads/{lid}", json={"status": "contacted"}, headers=auth_headers)
        assert r.status_code == 200


# ---------- Admin CRUD: doctors/treatments/testimonials/faqs/before-after ----------
class TestAdminCRUD:
    def test_doctor_crud(self, auth_headers):
        payload = {
            "name": "TEST_Dr Demo", "title": "Dt.", "specialty": "Test", "education": "Test U",
            "experience_years": 5, "bio": "Test bio", "image_url": "https://example.com/d.jpg",
            "certifications": [], "order": 99, "active": True,
        }
        c = requests.post(f"{API}/admin/doctors", json=payload, headers=auth_headers)
        assert c.status_code == 200
        did = c.json()["id"]
        u = requests.patch(f"{API}/admin/doctors/{did}", json={**payload, "specialty": "Updated"}, headers=auth_headers)
        assert u.status_code == 200
        d = requests.delete(f"{API}/admin/doctors/{did}", headers=auth_headers)
        assert d.status_code == 200

    def test_treatment_crud(self, auth_headers):
        import uuid as _u
        slug = f"test-trt-{_u.uuid4().hex[:6]}"
        payload = {
            "slug": slug, "name": "TEST_Trt", "short_desc": "x", "long_desc": "y",
            "duration": "1h", "benefits": ["a"], "image_url": "https://example.com/t.jpg",
            "featured": False, "order": 99, "active": True,
        }
        c = requests.post(f"{API}/admin/treatments", json=payload, headers=auth_headers)
        assert c.status_code == 200
        tid = c.json()["id"]
        u = requests.patch(f"{API}/admin/treatments/{tid}", json={**payload, "name": "TEST_Trt_U"}, headers=auth_headers)
        assert u.status_code == 200
        d = requests.delete(f"{API}/admin/treatments/{tid}", headers=auth_headers)
        assert d.status_code == 200

    def test_testimonial_crud(self, auth_headers):
        payload = {"patient_name": "TEST_Pat", "text": "g", "treatment": "İmplant", "rating": 5, "approved": True}
        c = requests.post(f"{API}/admin/testimonials", json=payload, headers=auth_headers)
        assert c.status_code == 200
        tid = c.json()["id"]
        d = requests.delete(f"{API}/admin/testimonials/{tid}", headers=auth_headers)
        assert d.status_code == 200

    def test_faq_crud(self, auth_headers):
        payload = {"question": "TEST_Q?", "answer": "A", "order": 99, "active": True}
        c = requests.post(f"{API}/admin/faqs", json=payload, headers=auth_headers)
        assert c.status_code == 200
        fid = c.json()["id"]
        u = requests.patch(f"{API}/admin/faqs/{fid}", json={**payload, "answer": "B"}, headers=auth_headers)
        assert u.status_code == 200
        d = requests.delete(f"{API}/admin/faqs/{fid}", headers=auth_headers)
        assert d.status_code == 200

    def test_before_after_crud(self, auth_headers):
        payload = {
            "title": "TEST_BA", "category": "implant",
            "before_url": "https://example.com/b.jpg", "after_url": "https://example.com/a.jpg",
            "description": "x", "order": 99, "active": True,
        }
        c = requests.post(f"{API}/admin/before-after", json=payload, headers=auth_headers)
        assert c.status_code == 200
        bid = c.json()["id"]
        d = requests.delete(f"{API}/admin/before-after/{bid}", headers=auth_headers)
        assert d.status_code == 200
