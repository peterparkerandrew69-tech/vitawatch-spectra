from datetime import datetime, timezone
from app.extensions import db

class ActivityEvent(db.Model):
    __tablename__ = 'activity_events'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    event_type = db.Column(db.String(50), nullable=False, default='general')  # 'walk', 'exercise', 'meditation', 'rest', etc.
    description = db.Column(db.String(255), nullable=False)
    duration_minutes = db.Column(db.Integer, default=15)
    calories_burned = db.Column(db.Float, default=0.0)

    @property
    def category(self):
        return self.event_type

    @category.setter
    def category(self, val):
        self.event_type = val

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'event_type': self.event_type,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'calories_burned': self.calories_burned
        }
