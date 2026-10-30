from datetime import datetime, timezone
from app.extensions import db

class ResearchSession(db.Model):
    __tablename__ = 'research_sessions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    researcher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='active')
    dataset_type = db.Column(db.String(64), default='multimodal_telemetry')
    record_count = db.Column(db.Integer, default=0)
    anonymized = db.Column(db.Boolean, default=True)
    metadata_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    researcher = db.relationship('User', backref='research_sessions')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'researcher_id': self.researcher_id,
            'status': self.status,
            'dataset_type': self.dataset_type,
            'record_count': self.record_count,
            'anonymized': self.anonymized,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
