import os
from flask import Flask
from app.config import Config
from app.extensions import db, cors
from app.utils.responses import error_response

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    cors_origins = app.config.get('CORS_ORIGINS', ['*'])
    if '*' in cors_origins:
        cors.init_app(
            app,
            resources={r"/api/*": {"origins": "*"}},
            supports_credentials=False
        )
    else:
        cors.init_app(
            app,
            resources={r"/api/*": {"origins": cors_origins}},
            supports_credentials=True
        )

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.vitals import vitals_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.devices import devices_bp
    from app.routes.analytics import analytics_bp
    from app.routes.cognitive import cognitive_bp
    from app.routes.emergency import emergency_bp
    from app.routes.caregiver import caregiver_bp
    from app.routes.research import research_bp
    from app.routes.notifications import notifications_bp
    from app.routes.stream import stream_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(vitals_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(devices_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(cognitive_bp)
    app.register_blueprint(emergency_bp)
    app.register_blueprint(caregiver_bp)
    app.register_blueprint(research_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(stream_bp)

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return error_response(str(e.description) if hasattr(e, "description") else "Bad request", 400)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint or resource not found", 404)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response("An internal server error occurred", 500)

    # Create tables & initial seed in development
    with app.app_context():
        db.create_all()
        seed_development_data()

    return app

def seed_development_data():
    from app.models.user import User
    from app.models.device import Device
    from app.models.caregiver import CaregiverRelationship
    from app.models.vital_reading import VitalReading
    from app.models.activity import ActivityEvent
    from app.models.cognitive_session import CognitiveSession
    from datetime import datetime, timezone, timedelta
    import random

    # Check if primary user already exists
    if User.query.filter_by(email="sandeep@vitawatch.ai").first():
        return

    # 1. Primary Patient User
    patient = User(
        email="sandeep@vitawatch.ai",
        full_name="Sandeep Roshan",
        role="patient",
        age=24,
        blood_group="O+"
    )
    patient.set_password("Spectra2026!")
    db.session.add(patient)

    # 2. Caregiver User
    caregiver = User(
        email="dr.elena@spectra-health.org",
        full_name="Dr. Elena Rostova",
        role="caregiver",
        age=39,
        blood_group="A+"
    )
    caregiver.set_password("Spectra2026!")
    db.session.add(caregiver)
    db.session.commit()

    # 3. Caregiver Relationship
    relationship = CaregiverRelationship(
        caregiver_id=caregiver.id,
        patient_id=patient.id,
        relationship="Attending Clinical Specialist",
        status="active",
        permissions="read_vitals,read_alerts,emergency_contact"
    )
    db.session.add(relationship)

    # 4. Registered ESP32 Spectra Device
    device = Device(
        device_id="ESP32-SPECTRA-A1",
        user_id=patient.id,
        name="VitaWatch Spectra Wristband (Alpha)",
        device_token="esp32_spectra_test_secret_2026",
        firmware_version="v2.4.1-spectra",
        hardware_model="ESP32-S3-WROOM",
        status="online",
        battery_level=89,
        supported_sensors="MAX30102,MPU6050,DS18B20,GSR",
        last_seen=datetime.now(timezone.utc)
    )
    db.session.add(device)

    # 5. Seed 24-hour historical vitals for dashboard trends
    now = datetime.now(timezone.utc)
    for i in range(24):
        timestamp = now - timedelta(hours=(23 - i))
        hr = int(72 + 6 * (1 if 12 <= i <= 18 else -1) + random.randint(-4, 4))
        spo2 = round(98.0 + random.uniform(-0.8, 1.2), 1)
        temp = round(36.5 + random.uniform(-0.2, 0.4), 1)
        reading = VitalReading(
            user_id=patient.id,
            device_id=device.device_id,
            timestamp=timestamp,
            heart_rate=hr,
            spo2=min(100.0, spo2),
            temperature=temp,
            gsr=round(1.2 + random.uniform(-0.2, 0.3), 2),
            accel_x=round(random.uniform(-0.1, 0.1), 3),
            accel_y=round(random.uniform(-0.1, 0.1), 3),
            accel_z=round(0.98 + random.uniform(-0.05, 0.05), 3),
            signal_quality=0.96,
            data_source="SENSOR_INGESTION",
            is_simulated=False
        )
        db.session.add(reading)

    # 6. Seed Recent Activities
    activities = [
        ("Resting Baseline Scan", "Autonomous circadian telemetry verification", "system", now - timedelta(hours=6)),
        ("Neuromotor AR Trial", "Score: 1820 pts | Latency: 214ms", "cognitive", now - timedelta(hours=4)),
        ("Vital Threshold Calibration", "All biometric indicators within standard variance", "vitals", now - timedelta(hours=1))
    ]
    for title, desc, cat, ts in activities:
        db.session.add(ActivityEvent(
            user_id=patient.id,
            title=title,
            description=desc,
            category=cat,
            timestamp=ts
        ))

    # 7. Seed Cognitive Sessions
    sessions = [
        ("reaction_speed", "hard", 218.4, 1850, 97.5, now - timedelta(hours=4)),
        ("reaction_speed", "medium", 242.1, 1420, 95.0, now - timedelta(days=1)),
        ("spatial_memory", "medium", 285.0, 1600, 92.0, now - timedelta(days=2))
    ]
    for t_type, diff, rt, sc, acc, ts in sessions:
        db.session.add(CognitiveSession(
            user_id=patient.id,
            task_type=t_type,
            difficulty=diff,
            reaction_time_ms=rt,
            score=sc,
            accuracy_percent=acc,
            is_completed=True,
            completed_at=ts
        ))

    db.session.commit()
