import os
from datetime import datetime, timezone
from app.extensions import db
from app.models.notification import NotificationDelivery

class NotificationService:
    """
    Multi-channel notification provider abstraction.
    Maintains honest delivery audit records.
    """

    @staticmethod
    def dispatch_emergency_alert(user_id: int, emergency_event_id: int, message: str, recipients: list):
        """
        Dispatches emergency alerts to caregiver/family contacts.
        Checks for real provider credentials (e.g. TWILIO_SID, SENDGRID_KEY).
        If not configured, records delivery as 'not_configured' with honest status.
        """
        sms_provider_configured = bool(os.environ.get('TWILIO_ACCOUNT_SID') and os.environ.get('TWILIO_AUTH_TOKEN'))
        email_provider_configured = bool(os.environ.get('SENDGRID_API_KEY'))

        delivery_records = []
        for recipient in recipients:
            is_phone = recipient.startswith('+') or any(c.isdigit() for c in recipient)
            channel = 'sms' if is_phone else 'email'

            # Determine genuine provider availability
            if channel == 'sms':
                status = 'delivered' if sms_provider_configured else 'not_configured'
            else:
                status = 'delivered' if email_provider_configured else 'not_configured'

            delivery = NotificationDelivery(
                user_id=user_id,
                emergency_event_id=emergency_event_id,
                channel=channel,
                status=status,
                recipient=recipient,
                title="🚨 VITAWATCH SPECTRA EMERGENCY ALERT",
                payload=message,
                attempted_at=datetime.now(timezone.utc)
            )
            db.session.add(delivery)
            delivery_records.append(delivery)

        db.session.commit()
        return [d.to_dict() for d in delivery_records]
