from flask import Blueprint, request
from app.extensions import db
from app.models.emergency_event import EmergencyEvent
from app.models.notification import NotificationDelivery
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response
from app.services.emergency_service import EmergencyService
from datetime import datetime, timezone

emergency_bp = Blueprint("emergency", __name__, url_prefix="/api/emergency")

@emergency_bp.route("/events", methods=["POST"])
@require_auth
def trigger_emergency(current_user):
    """
    Triggers an emergency event (e.g. from manual SOS button, voice keyword, or sensor threshold).
    Applies duplicate suppression within 45 seconds to prevent panic spam.
    """
    data = request.get_json() or {}
    source = data.get("source", "manual_sos")
    location = data.get("location", "Home / Primary Zone")
    latitude = data.get("latitude", 13.0827)
    longitude = data.get("longitude", 80.2707)
    sensor_context = data.get("sensor_context")
    severity = data.get("severity", "critical")
    target_hospital = data.get("target_hospital")
    relatives = data.get("relatives")

    event, is_new = EmergencyService.trigger_emergency(
        user_id=current_user.id,
        source=source,
        location=location,
        latitude=latitude,
        longitude=longitude,
        sensor_context=sensor_context,
        severity=severity,
        target_hospital=target_hospital,
        relatives=relatives
    )

    msg = "Emergency event dispatched and recorded" if is_new else "Emergency event already active (duplicate suppressed)"
    return success_response(event.to_dict(), msg, 201 if is_new else 200)

@emergency_bp.route("/events", methods=["GET"])
@require_auth
def list_emergency_events(current_user):
    """
    Returns history of emergency events with audit and notification status.
    """
    limit = min(int(request.args.get("limit", 20)), 100)
    events = EmergencyEvent.query.filter_by(user_id=current_user.id)\
        .order_by(EmergencyEvent.created_at.desc()).limit(limit).all()

    results = []
    for ev in events:
        d = ev.to_dict()
        notifications = NotificationDelivery.query.filter_by(emergency_event_id=ev.id).all()
        d["notifications"] = [n.to_dict() for n in notifications]
        results.append(d)

    return success_response(results, "Emergency events retrieved")

@emergency_bp.route("/events/<int:event_id>", methods=["GET"])
@require_auth
def get_emergency_event(current_user, event_id):
    """
    Retrieves full details of a specific emergency event.
    """
    event = EmergencyEvent.query.filter_by(id=event_id, user_id=current_user.id).first()
    if not event:
        return error_response("Emergency event not found or access denied", 404)

    d = event.to_dict()
    notifications = NotificationDelivery.query.filter_by(emergency_event_id=event.id).all()
    d["notifications"] = [n.to_dict() for n in notifications]
    return success_response(d, "Emergency event details retrieved")

@emergency_bp.route("/events/<int:event_id>/acknowledge", methods=["POST"])
@require_auth
def acknowledge_emergency(current_user, event_id):
    """
    Acknowledges active emergency event.
    """
    data = request.get_json() or {}
    notes = data.get("notes", "Acknowledged by user via Spectra console")

    event, err = EmergencyService.transition_event(event_id, "acknowledged", notes=notes)
    if err:
        return error_response(err, 400)

    return success_response(event.to_dict(), "Emergency event acknowledged")

@emergency_bp.route("/events/<int:event_id>/resolve", methods=["POST"])
@require_auth
def resolve_emergency(current_user, event_id):
    """
    Resolves or cancels (false alarm) active emergency event.
    """
    data = request.get_json() or {}
    is_false_alarm = data.get("false_alarm", False)
    target_status = "cancelled" if is_false_alarm else "resolved"
    notes = data.get("notes", "Marked as false alarm" if is_false_alarm else "Emergency resolved safely")

    event, err = EmergencyService.transition_event(event_id, target_status, notes=notes)
    if err:
        return error_response(err, 400)

    return success_response(event.to_dict(), f"Emergency event marked as {target_status}")

@emergency_bp.route("/status", methods=["GET"])
@require_auth
def get_active_status(current_user):
    """
    Quick status check for active alarms.
    """
    active_event = EmergencyEvent.query.filter(
        EmergencyEvent.user_id == current_user.id,
        EmergencyEvent.status.in_(["detected", "awaiting_confirmation", "confirmed", "alerting"])
    ).order_by(EmergencyEvent.created_at.desc()).first()

    return success_response({
        "has_active_emergency": active_event is not None,
        "active_event": active_event.to_dict() if active_event else None
    }, "Emergency status checked")
