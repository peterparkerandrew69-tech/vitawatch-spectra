from datetime import datetime, timezone
from app.extensions import db

class EmergencyEvent(db.Model):
    __tablename__ = 'emergency_events'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    source = db.Column(db.String(32), default='manual_sos')  # 'manual_sos', 'voice_keyword', 'fall_detection', 'sensor_anomaly'
    status = db.Column(db.String(32), default='detected')    # 'detected', 'awaiting_confirmation', 'confirmed', 'alerting', 'acknowledged', 'resolved', 'cancelled'
    severity = db.Column(db.String(16), default='critical')   # 'warning', 'critical'
    location = db.Column(db.String(120), default='Living Area')
    latitude = db.Column(db.Float, default=13.0827)
    longitude = db.Column(db.Float, default=80.2707)
    sensor_context = db.Column(db.Text, nullable=True)        # JSON string of deceleration, BPM, etc.
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    deliveries = db.relationship('NotificationDelivery', backref='emergency_event', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'source': self.source,
            'status': self.status,
            'severity': self.severity,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'sensor_context': self.sensor_context,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'notification_count': self.deliveries.count() if hasattr(self, 'deliveries') else 0
        }
