from datetime import datetime, timezone
from app.extensions import db

class CognitiveSession(db.Model):
    __tablename__ = 'cognitive_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    task_type = db.Column(db.String(50), default='visual_reaction')  # 'visual_reaction', 'memory_span', 'motor_coordination'
    reaction_time_ms = db.Column(db.Float, nullable=False)
    difficulty = db.Column(db.String(20), default='standard')
    score = db.Column(db.Integer, default=0)
    accuracy_percent = db.Column(db.Float, nullable=True)
    completion_status = db.Column(db.String(20), default='completed')  # 'completed', 'aborted', 'timed_out'
    notes = db.Column(db.String(255), nullable=True)
    raw_trials = db.Column(db.Text, nullable=True)  # JSON string of trials
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    @property
    def is_completed(self):
        return self.completion_status == 'completed'

    @is_completed.setter
    def is_completed(self, val):
        self.completion_status = 'completed' if val else 'in_progress'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'task_type': self.task_type,
            'reaction_time_ms': self.reaction_time_ms,
            'difficulty': self.difficulty,
            'score': self.score,
            'completion_status': self.completion_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
