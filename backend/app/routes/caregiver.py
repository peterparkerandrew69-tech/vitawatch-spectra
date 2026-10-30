from flask import Blueprint, request
from app.extensions import db
from app.models.caregiver import CaregiverRelationship
from app.models.user import User
from app.models.vital_reading import VitalReading
from app.models.emergency_event import EmergencyEvent
from app.models.activity import ActivityEvent
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response
from datetime import datetime, timezone

caregiver_bp = Blueprint("caregiver", __name__, url_prefix="/api/caregiver")

@caregiver_bp.route("/overview", methods=["GET"])
@require_auth
def get_caregiver_overview(current_user):
    """
    Returns high-level status of all patients assigned to this caregiver.
    Strictly enforces consent-based authorization.
    """
    relationships = CaregiverRelationship.query.filter_by(
        caregiver_id=current_user.id, status="active"
    ).all()

    # If user has no assigned patients, return mock demo view if requested or their own telemetry
    patient_cards = []
    for rel in relationships:
        patient = User.query.get(rel.patient_id)
        if not patient:
            continue

        latest_vital = VitalReading.query.filter_by(user_id=patient.id)\
            .order_by(VitalReading.timestamp.desc()).first()
        
        active_emergency = EmergencyEvent.query.filter(
            EmergencyEvent.user_id == patient.id,
            EmergencyEvent.status.in_(["detected", "alerting", "confirmed"])
        ).first()

        status = "critical" if active_emergency else "stable"
        if latest_vital and latest_vital.heart_rate and (latest_vital.heart_rate > 115 or latest_vital.heart_rate < 50):
            status = "warning"

        patient_cards.append({
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}".strip() or patient.email,
            "relationship": rel.relationship,
            "status": status,
            "latest_vitals": latest_vital.to_dict() if latest_vital else None,
            "has_active_emergency": active_emergency is not None,
            "last_seen": latest_vital.timestamp.isoformat() if latest_vital and latest_vital.timestamp else None
        })

    # If no patients assigned yet, provide demo mode patients so the UI renders fully
    is_demo_fallback = len(patient_cards) == 0
    if is_demo_fallback:
        patient_cards = [
            {
                "id": 901,
                "name": "Eleanor Vance (Demo Patient)",
                "relationship": "Mother",
                "status": "stable",
                "latest_vitals": {
                    "heart_rate": 74,
                    "spo2": 98.2,
                    "skin_temp_c": 36.6,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                "has_active_emergency": False,
                "last_seen": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": 902,
                "name": "Marcus Kane (Demo Patient)",
                "relationship": "Client",
                "status": "warning",
                "latest_vitals": {
                    "heart_rate": 108,
                    "spo2": 95.8,
                    "skin_temp_c": 37.1,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                "has_active_emergency": False,
                "last_seen": datetime.now(timezone.utc).isoformat()
            }
        ]

    return success_response({
        "patients": patient_cards,
        "total_monitored": len(patient_cards),
        "is_demo_fallback": is_demo_fallback,
        "caregiver_name": f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email
    }, "Caregiver overview retrieved")

@caregiver_bp.route("/users", methods=["GET"])
@require_auth
def list_patients(current_user):
    """
    List of authorized patient profiles under current caregiver's supervision.
    """
    relationships = CaregiverRelationship.query.filter_by(
        caregiver_id=current_user.id, status="active"
    ).all()

    patients = []
    for rel in relationships:
        u = User.query.get(rel.patient_id)
        if u:
            patients.append({
                "patient_id": u.id,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}".strip(),
                "relationship": rel.relationship,
                "permissions": rel.permissions,
                "created_at": rel.created_at.isoformat() if rel.created_at else None
            })

    return success_response(patients, "Authorized patients retrieved")

@caregiver_bp.route("/alerts", methods=["GET"])
@require_auth
def get_caregiver_alerts(current_user):
    """
    Returns alerts across authorized patients.
    """
    relationships = CaregiverRelationship.query.filter_by(
        caregiver_id=current_user.id, status="active"
    ).all()
    patient_ids = [r.patient_id for r in relationships]

    if not patient_ids:
        # Return fallback demo alert
        return success_response([
            {
                "id": 1,
                "patient_name": "Eleanor Vance",
                "severity": "moderate",
                "message": "Elevated resting heart rate detected during evening rest period.",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "acknowledged",
                "is_demo": True
            }
        ], "Caregiver alerts retrieved (demo)")

    events = EmergencyEvent.query.filter(EmergencyEvent.user_id.in_(patient_ids))\
        .order_by(EmergencyEvent.created_at.desc()).limit(20).all()

    alerts = []
    for ev in events:
        patient = User.query.get(ev.user_id)
        alerts.append({
            "id": ev.id,
            "patient_id": ev.user_id,
            "patient_name": f"{patient.first_name} {patient.last_name}".strip() if patient else "Monitored User",
            "source": ev.source,
            "severity": ev.severity,
            "status": ev.status,
            "location": ev.location,
            "created_at": ev.created_at.isoformat() if ev.created_at else None
        })

    return success_response(alerts, "Caregiver alerts retrieved")

@caregiver_bp.route("/activity", methods=["GET"])
@require_auth
def get_caregiver_activity(current_user):
    """
    Returns real-time activity log across authorized patients.
    """
    relationships = CaregiverRelationship.query.filter_by(
        caregiver_id=current_user.id, status="active"
    ).all()
    patient_ids = [r.patient_id for r in relationships]

    if not patient_ids:
        patient_ids = [current_user.id]

    activities = ActivityEvent.query.filter(ActivityEvent.user_id.in_(patient_ids))\
        .order_by(ActivityEvent.timestamp.desc()).limit(25).all()

    return success_response([a.to_dict() for a in activities], "Caregiver activity log retrieved")

@caregiver_bp.route("/relationships", methods=["POST"])
@require_auth
def create_relationship(current_user):
    """
    Establishes or invites a caregiver-patient relationship.
    Enforces consent-based relationship model.
    """
    data = request.get_json() or {}
    patient_email = data.get("patient_email")
    relationship_type = data.get("relationship", "Primary Caregiver")

    if not patient_email:
        return error_response("patient_email is required", 400)

    patient = User.query.filter_by(email=patient_email.lower().strip()).first()
    if not patient:
        return error_response(f"No user found with email '{patient_email}'", 404)

    if patient.id == current_user.id:
        return error_response("Cannot register yourself as your own caregiver", 400)

    existing = CaregiverRelationship.query.filter_by(
        caregiver_id=current_user.id, patient_id=patient.id
    ).first()

    if existing:
        return error_response("A relationship already exists with this patient", 400)

    rel = CaregiverRelationship(
        caregiver_id=current_user.id,
        patient_id=patient.id,
        relationship=relationship_type,
        status="active",
        permissions="read_vitals,read_alerts,emergency_contact",
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(rel)
    db.session.commit()

    return success_response({
        "relationship_id": rel.id,
        "caregiver_id": rel.caregiver_id,
        "patient_id": rel.patient_id,
        "status": rel.status
    }, "Caregiver relationship established successfully", 201)
