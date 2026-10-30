from datetime import datetime, timezone
from app.extensions import db

class CaregiverRelationship(db.Model):
    __tablename__ = 'caregiver_relationships'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    caregiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status = db.Column(db.String(20), default='active')  # 'pending', 'active', 'revoked'
    relationship = db.Column(db.String(60), default='Primary Caregiver')
    permissions = db.Column(db.String(255), default='vitals,emergency,activity')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    patient = db.relationship('User', foreign_keys=[patient_id], backref='caregiver_links')
    caregiver = db.relationship('User', foreign_keys=[caregiver_id], backref='patient_links')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'caregiver_id': self.caregiver_id,
            'patient_name': self.patient.full_name if self.patient else None,
            'caregiver_name': self.caregiver.full_name if self.caregiver else None,
            'status': self.status,
            'permissions': self.permissions.split(',') if self.permissions else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
