from datetime import datetime, timezone, timedelta
from app.extensions import db
from app.models.emergency_event import EmergencyEvent
from app.models.caregiver import CaregiverRelationship
from app.services.notification_service import NotificationService

VALID_STATUSES = {
    'detected', 'awaiting_confirmation', 'confirmed', 
    'alerting', 'acknowledged', 'resolved', 'cancelled'
}

VALID_TRANSITIONS = {
    'detected': {'awaiting_confirmation', 'confirmed', 'alerting', 'acknowledged', 'cancelled'},
    'awaiting_confirmation': {'confirmed', 'alerting', 'acknowledged', 'cancelled'},
    'confirmed': {'alerting', 'acknowledged', 'resolved', 'cancelled'},
    'alerting': {'acknowledged', 'resolved', 'cancelled'},
    'acknowledged': {'resolved', 'cancelled'},
    'resolved': set(),
    'cancelled': set()
}

class EmergencyService:
    @staticmethod
    def trigger_emergency(user_id: int, source: str = 'manual_sos', location: str = 'Living Area',
                          latitude: float = 13.0827, longitude: float = 80.2707, 
                          sensor_context: str = None, severity: str = 'critical',
                          target_hospital: str = None, relatives: list = None):
        """
        Creates an emergency event with duplicate suppression within 45 seconds.
        """
        now = datetime.now(timezone.utc)
        recent_window = now - timedelta(seconds=45)
        
        # Check for active duplicate event
        recent_duplicate = EmergencyEvent.query.filter(
            EmergencyEvent.user_id == user_id,
            EmergencyEvent.status.in_(['detected', 'awaiting_confirmation', 'confirmed', 'alerting']),
            EmergencyEvent.created_at >= recent_window
        ).first()

        if recent_duplicate:
            return recent_duplicate, False  # Was suppressed as duplicate

        initial_status = 'confirmed' if source == 'manual_sos' else 'detected'

        event = EmergencyEvent(
            user_id=user_id,
            source=source,
            status=initial_status,
            severity=severity,
            location=location,
            latitude=latitude,
            longitude=longitude,
            sensor_context=sensor_context,
            created_at=now
        )
        db.session.add(event)
        db.session.commit()

        # If manual SOS or critical, immediately dispatch alert attempt
        if initial_status == 'confirmed':
            EmergencyService.escalate_to_alerting(event, target_hospital=target_hospital, relatives=relatives)

        return event, True

    @staticmethod
    def escalate_to_alerting(event: EmergencyEvent, target_hospital: str = None, relatives: list = None):
        event.status = 'alerting'
        db.session.commit()

        # Find authorized caregivers and relatives
        caregiver_links = CaregiverRelationship.query.filter_by(
            patient_id=event.user_id, status='active'
        ).all()

        recipients = [link.caregiver.email for link in caregiver_links if link.caregiver and link.caregiver.email]
        if relatives and isinstance(relatives, list):
            recipients.extend(relatives)
        if not recipients:
            recipients = ['dr.elena@spectra-health.org', '+1-555-0199', 'nextofkin@vitawatch.ai']

        hospital_target = target_hospital or "Apollo Speciality Hospital (ER Trauma Bay)"
        gps_url = f"https://maps.google.com/?q={event.latitude},{event.longitude}"

        msg = (
            f"🚨 CRITICAL SOS DISPATCH: {event.source.upper()} activated at {event.location}. "
            f"Live GPS Pin: {gps_url}. "
            f"Automated Hospital ER Route: {hospital_target}. "
            f"Status: ALERTING - Emergency Response & Relatives Notified."
        )

        # 1. Dispatch to caregivers and relatives
        NotificationService.dispatch_emergency_alert(
            user_id=event.user_id,
            emergency_event_id=event.id,
            message=msg,
            recipients=recipients
        )

        # 2. Transmit to Nearby Hospital Triage Desk
        hospital_recipients = [
            f"er-trauma-triage@{hospital_target.lower().split()[0]}.org",
            "city-emergency-dispatch@health.gov"
        ]
        NotificationService.dispatch_emergency_alert(
            user_id=event.user_id,
            emergency_event_id=event.id,
            message=f"HOSPITAL INCOMING TRAUMA ALERT: Patient GPS {event.latitude},{event.longitude}. Routing to {hospital_target}. Vitals context: {event.sensor_context or 'Live Telemetry Active'}.",
            recipients=hospital_recipients
        )

    @staticmethod
    def transition_event(event_id: int, new_status: str, notes: str = None):
        event = EmergencyEvent.query.get(event_id)
        if not event:
            return None, "Emergency event not found"

        if new_status not in VALID_STATUSES:
            return None, f"Invalid status '{new_status}'"

        allowed = VALID_TRANSITIONS.get(event.status, set())
        if new_status not in allowed:
            return None, f"Illegal state transition from '{event.status}' to '{new_status}'"

        event.status = new_status
        if notes:
            event.notes = f"{(event.notes or '')}\n[{datetime.now(timezone.utc).isoformat()}] {notes}".strip()

        if new_status in ('resolved', 'cancelled'):
            event.resolved_at = datetime.now(timezone.utc)
        elif new_status == 'alerting':
            EmergencyService.escalate_to_alerting(event)

        db.session.commit()
        return event, None
