from datetime import datetime, timezone
from app.extensions import db

class VitalReading(db.Model):
    __tablename__ = 'vital_readings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    device_id = db.Column(db.String(64), nullable=True, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Core Physiological Metrics
    heart_rate = db.Column(db.Float, nullable=True)          # BPM
    spo2 = db.Column(db.Float, nullable=True)                # % SpO2
    blood_pressure_sys = db.Column(db.Float, nullable=True)  # mmHg systolic
    blood_pressure_dia = db.Column(db.Float, nullable=True)  # mmHg diastolic
    temperature = db.Column(db.Float, nullable=True)         # Fahrenheit (°F)
    gsr = db.Column(db.Float, nullable=True)                 # Galvanic Skin Response (uS)
    
    # Motion / Accelerometer
    accel_x = db.Column(db.Float, nullable=True)
    accel_y = db.Column(db.Float, nullable=True)
    accel_z = db.Column(db.Float, nullable=True)
    gyro_x = db.Column(db.Float, nullable=True)
    gyro_y = db.Column(db.Float, nullable=True)
    gyro_z = db.Column(db.Float, nullable=True)

    # Signal & Provenance Metadata
    signal_quality = db.Column(db.Float, default=1.0)        # 0.0 to 1.0 (e.g. PPG SNR)
    data_source = db.Column(db.String(32), default='simulated_demo') # 'esp32_sensor', 'ble_companion', 'simulated_demo'
    is_simulated = db.Column(db.Boolean, default=True)

    @property
    def skin_temp_c(self):
        return self.temperature

    @skin_temp_c.setter
    def skin_temp_c(self, val):
        self.temperature = val

    @property
    def provenance(self):
        return self.data_source

    @provenance.setter
    def provenance(self, val):
        self.data_source = val

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'device_id': self.device_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'heart_rate': self.heart_rate,
            'spo2': self.spo2,
            'blood_pressure_sys': self.blood_pressure_sys,
            'blood_pressure_dia': self.blood_pressure_dia,
            'temperature': self.temperature,
            'gsr': self.gsr,
            'accel': {'x': self.accel_x, 'y': self.accel_y, 'z': self.accel_z} if self.accel_x is not None else None,
            'gyro': {'x': self.gyro_x, 'y': self.gyro_y, 'z': self.gyro_z} if self.gyro_x is not None else None,
            'signal_quality': self.signal_quality,
            'data_source': self.data_source,
            'is_simulated': self.is_simulated
        }
