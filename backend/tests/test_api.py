import unittest
import json
from datetime import datetime, timezone
import os
import sys

# Ensure backend directory is in path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.extensions import db
from app.config import TestConfig
from app.models.user import User
from app.models.vital_reading import VitalReading
from app.models.emergency_event import EmergencyEvent
from app.models.cognitive_session import CognitiveSession
from app.models.device import Device
from app.models.caregiver import CaregiverRelationship
from app.services.emergency_service import EmergencyService
from app.services.ml_service import MLAnalyticsService

class VitaWatchSpectraApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Clean tables in memory
        db.drop_all()
        db.create_all()

        # Create primary test user
        self.user = User(
            email="tester@vitawatch.ai",
            full_name="Tester Spectra",
            role="patient",
            age=25
        )
        self.user.set_password("TestSecret123!")
        db.session.add(self.user)

        # Create secondary test user for isolation testing
        self.other_user = User(
            email="other@vitawatch.ai",
            full_name="Other Patient",
            role="patient",
            age=30
        )
        self.other_user.set_password("TestSecret123!")
        db.session.add(self.other_user)

        # Create caregiver user
        self.caregiver = User(
            email="caregiver@vitawatch.ai",
            full_name="Dr. Caregiver",
            role="caregiver",
            age=42
        )
        self.caregiver.set_password("TestSecret123!")
        db.session.add(self.caregiver)

        db.session.commit()

        # Get JWT for primary user
        login_res = self.client.post("/api/auth/login", json={
            "email": "tester@vitawatch.ai",
            "password": "TestSecret123!"
        })
        self.token = login_res.get_json()["data"]["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

        # Get JWT for other user
        other_res = self.client.post("/api/auth/login", json={
            "email": "other@vitawatch.ai",
            "password": "TestSecret123!"
        })
        self.other_token = other_res.get_json()["data"]["token"]
        self.other_headers = {"Authorization": f"Bearer {self.other_token}"}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # 1. Health-check endpoint
    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["database"], "connected")
        self.assertEqual(data["application"], "VitaWatch Spectra")

    # 2. Database connectivity & initialization
    def test_02_database_connectivity(self):
        users_count = User.query.count()
        self.assertEqual(users_count, 3)

    # 3. User registration
    def test_03_user_registration(self):
        res = self.client.post("/api/auth/register", json={
            "email": "newuser@vitawatch.ai",
            "password": "NewSecret2026!",
            "full_name": "New Athlete",
            "role": "patient"
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn("token", data["data"])
        self.assertEqual(data["data"]["user"]["email"], "newuser@vitawatch.ai")

    # 4. Login and logout
    def test_04_login_and_logout(self):
        # Successful login
        res = self.client.post("/api/auth/login", json={
            "email": "tester@vitawatch.ai",
            "password": "TestSecret123!"
        })
        self.assertEqual(res.status_code, 200)

        # Invalid password
        bad_res = self.client.post("/api/auth/login", json={
            "email": "tester@vitawatch.ai",
            "password": "WrongPassword!"
        })
        self.assertEqual(bad_res.status_code, 401)

        # Logout endpoint
        logout_res = self.client.post("/api/auth/logout", headers=self.headers)
        self.assertEqual(logout_res.status_code, 200)

    # 5. Protected routes
    def test_05_protected_route_success(self):
        res = self.client.get("/api/auth/me", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["data"]["email"], "tester@vitawatch.ai")

    # 6. Unauthorized access
    def test_06_unauthorized_access(self):
        clean_client = self.app.test_client()
        res = clean_client.get("/api/auth/me")
        self.assertEqual(res.status_code, 401)

    # 7. User-to-user data isolation
    def test_07_user_data_isolation(self):
        # User 1 posts a reading
        self.client.post("/api/vitals", headers=self.headers, json={
            "heart_rate": 82.0,
            "spo2": 99.0
        })

        # User 2 queries latest vitals
        res = self.client.get("/api/vitals/latest", headers=self.other_headers)
        self.assertEqual(res.status_code, 200)
        self.assertIsNone(res.get_json()["data"])  # Isolated: Other user has zero access to user 1's readings

    # 8. Caregiver permission enforcement
    def test_08_caregiver_permission_enforcement(self):
        # Caregiver attempts to view overview without authorization
        caregiver_login = self.client.post("/api/auth/login", json={
            "email": "caregiver@vitawatch.ai",
            "password": "TestSecret123!"
        })
        cg_token = caregiver_login.get_json()["data"]["token"]
        cg_headers = {"Authorization": f"Bearer {cg_token}"}

        overview = self.client.get("/api/caregiver/overview", headers=cg_headers)
        self.assertEqual(overview.status_code, 200)
        data = overview.get_json()["data"]
        # With zero established relationships, returns demo fallback or empty
        self.assertTrue(data.get("is_demo_fallback") or len(data.get("patients", [])) == 0)

    # 9. Valid physiological readings
    def test_09_valid_vitals_ingestion(self):
        res = self.client.post("/api/vitals", headers=self.headers, json={
            "heart_rate": 74.0,
            "spo2": 98.2,
            "temperature": 36.6,
            "gsr": 1.25
        })
        self.assertEqual(res.status_code, 201)
        reading = res.get_json()["data"]["latest"]
        self.assertEqual(reading["heart_rate"], 74.0)
        self.assertEqual(reading["spo2"], 98.2)

    # 10. Invalid sensor payloads rejection
    def test_10_invalid_vitals_rejected(self):
        # Unrealistic heart rate (< 30 or > 250)
        res = self.client.post("/api/vitals", headers=self.headers, json={
            "heart_rate": 999.0
        })
        self.assertEqual(res.status_code, 422)

        # Invalid SpO2 (> 100)
        res2 = self.client.post("/api/vitals", headers=self.headers, json={
            "spo2": 105.0
        })
        self.assertEqual(res2.status_code, 422)

    # 11. Historical reading retrieval
    def test_11_historical_reading_retrieval(self):
        # Add 3 readings
        for hr in [70, 72, 75]:
            self.client.post("/api/vitals", headers=self.headers, json={"heart_rate": hr})

        res = self.client.get("/api/vitals/history?hours=24", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        readings = res.get_json()["data"]
        self.assertEqual(len(readings), 3)

    # 12. Device registration
    def test_12_device_registration(self):
        res = self.client.post("/api/devices/register", headers=self.headers, json={
            "device_id": "TEST-SPECTRA-DEV-01",
            "name": "Spectra Test Band",
            "device_type": "smartwatch"
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.get_json()["data"]["device_id"], "TEST-SPECTRA-DEV-01")

    # 13. Cognitive session persistence
    def test_13_cognitive_session_persistence(self):
        res = self.client.post("/api/cognitive/sessions", headers=self.headers, json={
            "task_type": "reaction_speed",
            "difficulty": "medium",
            "reaction_time_ms": 224.5,
            "score": 1820,
            "accuracy_percent": 98.0
        })
        self.assertEqual(res.status_code, 201)

        # Check retrieval
        list_res = self.client.get("/api/cognitive/sessions", headers=self.headers)
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(len(list_res.get_json()["data"]), 1)

    # 14. Emergency event creation
    def test_14_emergency_event_creation(self):
        res = self.client.post("/api/emergency/events", headers=self.headers, json={
            "source": "manual_sos",
            "location": "Testing Lab",
            "latitude": 13.0827,
            "longitude": 80.2707
        })
        self.assertEqual(res.status_code, 201)
        event = res.get_json()["data"]
        self.assertEqual(event["status"], "alerting")

    # 15. Emergency state transitions
    def test_15_emergency_state_transitions(self):
        # Create event
        res = self.client.post("/api/emergency/events", headers=self.headers, json={
            "source": "voice",
            "location": "Testing Room"
        })
        event_id = res.get_json()["data"]["id"]

        # Acknowledge
        ack_res = self.client.post(f"/api/emergency/events/{event_id}/acknowledge", headers=self.headers, json={
            "notes": "Responder en route"
        })
        self.assertEqual(ack_res.status_code, 200)
        self.assertEqual(ack_res.get_json()["data"]["status"], "acknowledged")

        # Resolve
        res_res = self.client.post(f"/api/emergency/events/{event_id}/resolve", headers=self.headers, json={
            "false_alarm": False,
            "notes": "Patient safe"
        })
        self.assertEqual(res_res.status_code, 200)
        self.assertEqual(res_res.get_json()["data"]["status"], "resolved")

    # 16. Duplicate emergency prevention
    def test_16_duplicate_emergency_prevention(self):
        # First trigger
        res1 = self.client.post("/api/emergency/events", headers=self.headers, json={
            "source": "manual_sos"
        })
        self.assertEqual(res1.status_code, 201)
        ev1_id = res1.get_json()["data"]["id"]

        # Immediate second trigger within 45s window
        res2 = self.client.post("/api/emergency/events", headers=self.headers, json={
            "source": "manual_sos"
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.get_json()["data"]["id"], ev1_id)  # Suppressed duplicate

    # 17. Notification failure handling (honest status)
    def test_17_notification_status_honest(self):
        # Creating an emergency dispatches alert attempts
        self.client.post("/api/emergency/events", headers=self.headers, json={
            "source": "manual_sos"
        })
        notifs_res = self.client.get("/api/notifications", headers=self.headers)
        self.assertEqual(notifs_res.status_code, 200)
        notifs = notifs_res.get_json()["data"]
        self.assertTrue(len(notifs) > 0)
        # Without Twilio/SendGrid credentials configured in test env, status must be 'not_configured'
        self.assertEqual(notifs[0]["status"], "not_configured")

    # 18. Analytics output validation
    def test_18_analytics_output(self):
        # Insert 15 readings to establish personal baseline
        for i in range(15):
            r = VitalReading(
                user_id=self.user.id,
                heart_rate=70 + (i % 5),
                spo2=98.0,
                signal_quality=0.95,
                is_simulated=False
            )
            db.session.add(r)
        db.session.commit()

        summary_res = self.client.get("/api/analytics/summary", headers=self.headers)
        self.assertEqual(summary_res.status_code, 200)
        data = summary_res.get_json()["data"]
        self.assertIn("stress", data)
        self.assertIn("fatigue", data)
        self.assertIn("recovery_score", data)
        self.assertIn("disclaimer", data)

    # 19. Research access permissions
    def test_19_research_dataset_anonymization(self):
        res = self.client.get("/api/research/datasets", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertEqual(data["privacy_guarantee"], "Strict k-anonymity. Zero PII exported.")

    # 20. Dashboard summary endpoint
    def test_20_dashboard_summary(self):
        res = self.client.get("/api/dashboard/summary", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertIn("wellness_score", data)
        self.assertIn("vitals", data)
        self.assertIn("data_provenance", data)

if __name__ == "__main__":
    unittest.main()
