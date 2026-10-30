from datetime import datetime, timezone
from app.extensions import db

class NotificationDelivery(db.Model):
    __tablename__ = 'notification_deliveries'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    emergency_event_id = db.Column(db.Integer, db.ForeignKey('emergency_events.id', ondelete='SET NULL'), nullable=True, index=True)
    channel = db.Column(db.String(20), default='push')  # 'sms', 'email', 'push', 'webhook'
    status = db.Column(db.String(20), default='not_configured')  # 'delivered', 'failed', 'not_configured', 'pending'
    recipient = db.Column(db.String(120), nullable=False)
    title = db.Column(db.String(120), default='Biometric Telemetry Alert')
    payload = db.Column(db.Text, nullable=True)
    attempted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_read = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'emergency_event_id': self.emergency_event_id,
            'channel': self.channel,
            'status': self.status,
            'recipient': self.recipient,
            'title': self.title,
            'payload': self.payload,
            'attempted_at': self.attempted_at.isoformat() if self.attempted_at else None,
            'is_read': self.is_read
        }
