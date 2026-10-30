from datetime import datetime, timezone
from flask import Blueprint, request, g, current_app
from app.extensions import db
from app.models.device import Device
from app.models.vital_reading import VitalReading
from app.models.user import User
from app.utils.decorators import require_auth, require_device_auth
from app.utils.responses import success_response, error_response

devices_bp = Blueprint('devices', __name__, url_prefix='/api/devices')

@devices_bp.route('', methods=['GET'])
@require_auth
def get_user_devices():
    devices = Device.query.filter_by(user_id=g.current_user.id).all()
    return success_response([d.to_dict() for d in devices], message="Connected devices retrieved.")

@devices_bp.route('/register', methods=['POST'])
@require_auth
def register_device():
    data = request.get_json(silent=True) or {}
    device_id = data.get('device_id', '').strip()
    name = data.get('name', '').strip()
    device_type = data.get('device_type', 'smartwatch')

    if not device_id or not name:
        return error_response('Device ID and name are required.', status_code=400)

    existing = Device.query.filter_by(device_id=device_id).first()
    if existing:
        # Update owner if re-registering
        existing.user_id = g.current_user.id
        existing.name = name
        existing.status = 'connected'
        existing.last_seen_at = datetime.now(timezone.utc)
        db.session.commit()
        return success_response(existing.to_dict(), message="Device re-registered successfully.")

    device = Device(
        device_id=device_id,
        user_id=g.current_user.id,
        name=name,
        device_type=device_type,
        status='connected',
        battery_level=data.get('battery_level', 100),
        firmware_version=data.get('firmware_version', 'v3.0.4-spectra'),
        supported_sensors=data.get('supported_sensors', 'ppg,imu,temp,gsr'),
        last_seen_at=datetime.now(timezone.utc)
    )
    db.session.add(device)
    db.session.commit()
    return success_response(device.to_dict(), message="Device registered successfully.", status_code=201)

@devices_bp.route('/<device_id>/status', methods=['POST'])
@require_device_auth
def update_device_status(device_id):
    data = request.get_json(silent=True) or {}
    device = Device.query.filter_by(device_id=device_id).first()
    if not device:
        return error_response('Device not found.', status_code=404)

    if 'battery_level' in data:
        device.battery_level = int(data['battery_level'])
    if 'status' in data:
        device.status = data['status']
    device.last_seen_at = datetime.now(timezone.utc)
    db.session.commit()
    return success_response(device.to_dict(), message="Device status updated.")

@devices_bp.route('/ingest', methods=['POST'])
@require_device_auth
def ingest_sensor_reading():
    """
    Dedicated endpoint for ESP32 and BLE companion hardware gateway ingestion.
    Authenticates via X-Device-Key or User Bearer token.
    Saves verified physical sensor readings (is_simulated = False).
    """
    data = request.get_json(silent=True) or {}
    device_id = data.get('device_id')
    user_id = data.get('user_id')

    # If authenticated via user bearer token, enforce current_user ownership
    if hasattr(g, 'current_user') and g.current_user:
        user_id = g.current_user.id

    if not user_id:
        # Fallback to finding user associated with registered device
        if device_id:
            dev = Device.query.filter_by(device_id=device_id).first()
            if dev:
                user_id = dev.user_id
        if not user_id:
            # Fallback to first user in system
            user = User.query.first()
            user_id = user.id if user else 1

    measurements = data.get('measurements', {})
    accel = measurements.get('accel', {})
    gyro = measurements.get('gyro', {})

    raw_ts = data.get('timestamp')
    timestamp = datetime.fromisoformat(raw_ts.replace('Z', '+00:00')) if raw_ts else datetime.now(timezone.utc)

    reading = VitalReading(
        user_id=user_id,
        device_id=device_id or 'esp32-gateway',
        timestamp=timestamp,
        heart_rate=measurements.get('heart_rate'),
        spo2=measurements.get('spo2'),
        blood_pressure_sys=measurements.get('blood_pressure_sys'),
        blood_pressure_dia=measurements.get('blood_pressure_dia'),
        temperature=measurements.get('temperature'),
        gsr=measurements.get('gsr'),
        accel_x=accel.get('x'),
        accel_y=accel.get('y'),
        accel_z=accel.get('z'),
        gyro_x=gyro.get('x'),
        gyro_y=gyro.get('y'),
        gyro_z=gyro.get('z'),
        signal_quality=data.get('signal_quality', 0.95),
        data_source='esp32_sensor',
        is_simulated=False  # Genuinely originated from physical gateway
    )
    db.session.add(reading)

    # Touch device last_seen_at
    if device_id:
        dev = Device.query.filter_by(device_id=device_id).first()
        if dev:
            dev.last_seen_at = datetime.now(timezone.utc)
            if 'battery_level' in data:
                dev.battery_level = int(data['battery_level'])

    db.session.commit()
    return success_response(
        {'reading_id': reading.id, 'data_source': 'esp32_sensor', 'status': 'stored'},
        message="Physical sensor reading ingested successfully.",
        status_code=201
    )
