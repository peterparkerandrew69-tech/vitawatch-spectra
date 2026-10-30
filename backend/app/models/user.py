from datetime import datetime, timezone
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='patient')  # 'patient', 'caregiver', 'researcher'
    age = db.Column(db.Integer, default=24)
    height = db.Column(db.String(20), default="5'10\"")
    weight = db.Column(db.String(20), default="72 kg")
    blood_group = db.Column(db.String(10), default="O+")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def first_name(self):
        parts = (self.full_name or "").strip().split()
        return parts[0] if parts else ""

    @property
    def last_name(self):
        parts = (self.full_name or "").strip().split()
        return parts[-1] if len(parts) > 1 else ""

    # Relationships
    vitals = db.relationship('VitalReading', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    activities = db.relationship('ActivityEvent', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    emergency_events = db.relationship('EmergencyEvent', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    cognitive_sessions = db.relationship('CognitiveSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    devices = db.relationship('Device', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        names = self.full_name.strip().split()
        initials = (names[0][0] + names[-1][0]).upper() if len(names) > 1 else self.full_name[:2].upper() if self.full_name else 'SR'
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'age': self.age,
            'height': self.height,
            'weight': self.weight,
            'blood_group': self.blood_group,
            'initials': initials,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
