from datetime import datetime, timezone
from app.extensions import db

class Device(db.Model):
    __tablename__ = 'devices'

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    device_token = db.Column(db.String(128), nullable=True)
    device_type = db.Column(db.String(50), default='smartwatch')  # 'smartwatch', 'fitness_band', 'scale', 'esp32_gateway'
    hardware_model = db.Column(db.String(50), default='ESP32-S3-WROOM')
    status = db.Column(db.String(20), default='connected')        # 'connected', 'standby', 'disconnected'
    battery_level = db.Column(db.Integer, default=100)
    firmware_version = db.Column(db.String(32), default='v3.0.4-spectra')
    supported_sensors = db.Column(db.String(255), default='ppg,imu,temp,gsr')
    last_seen_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    registered_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def last_seen(self):
        return self.last_seen_at

    @last_seen.setter
    def last_seen(self, val):
        self.last_seen_at = val

    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'user_id': self.user_id,
            'name': self.name,
            'device_type': self.device_type,
            'status': self.status,
            'battery_level': self.battery_level,
            'firmware_version': self.firmware_version,
            'supported_sensors': self.supported_sensors.split(',') if self.supported_sensors else [],
            'last_seen_at': self.last_seen_at.isoformat() if self.last_seen_at else None,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None
        }
