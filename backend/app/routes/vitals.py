from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, g
from app.extensions import db
from app.models.vital_reading import VitalReading
from app.models.user import User
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response

vitals_bp = Blueprint('vitals', __name__, url_prefix='/api/vitals')

def validate_vital_data(data):
    errors = []
    hr = data.get('heart_rate')
    if hr is not None:
        try:
            hr_val = float(hr)
            if not (30 <= hr_val <= 250):
                errors.append("Heart rate must be between 30 and 250 BPM.")
        except (ValueError, TypeError):
            errors.append("Heart rate must be a valid number.")

    spo2 = data.get('spo2')
    if spo2 is not None:
        try:
            spo2_val = float(spo2)
            if not (50 <= spo2_val <= 100):
                errors.append("SpO2 must be between 50% and 100%.")
        except (ValueError, TypeError):
            errors.append("SpO2 must be a valid percentage.")

    temp = data.get('temperature')
    if temp is not None:
        try:
            temp_val = float(temp)
            # Accept either Celsius (30°C to 45°C) or Fahrenheit (85°F to 115°F)
            if not (30 <= temp_val <= 45 or 80 <= temp_val <= 115):
                errors.append("Temperature must be between 30°C-45°C or 80°F-115°F.")
        except (ValueError, TypeError):
            errors.append("Temperature must be a valid number.")

    return errors

@vitals_bp.route('', methods=['POST'])
@require_auth
def submit_vitals():
    data = request.get_json(silent=True) or {}
    user_id = g.current_user.id

    # Support batch or single payload
    items = data.get('readings') if isinstance(data.get('readings'), list) else [data]
    if not items or len(items) == 0:
        return error_response('Payload contains no readings.', status_code=400)

    if len(items) > 500:
        return error_response('Batch size limit exceeded (max 500 readings per request).', status_code=413)

    created_records = []
    for item in items:
        val_errors = validate_vital_data(item)
        if val_errors:
            return error_response('Validation failed for one or more measurements.', errors=val_errors, status_code=422)

        raw_ts = item.get('timestamp')
        timestamp = datetime.fromisoformat(raw_ts.replace('Z', '+00:00')) if raw_ts else datetime.now(timezone.utc)

        reading = VitalReading(
            user_id=user_id,
            device_id=item.get('device_id', 'manual-portal'),
            timestamp=timestamp,
            heart_rate=item.get('heart_rate'),
            spo2=item.get('spo2'),
            blood_pressure_sys=item.get('blood_pressure_sys'),
            blood_pressure_dia=item.get('blood_pressure_dia'),
            temperature=item.get('temperature'),
            gsr=item.get('gsr'),
            accel_x=item.get('accel_x'),
            accel_y=item.get('accel_y'),
            accel_z=item.get('accel_z'),
            gyro_x=item.get('gyro_x'),
            gyro_y=item.get('gyro_y'),
            gyro_z=item.get('gyro_z'),
            signal_quality=item.get('signal_quality', 1.0),
            data_source=item.get('data_source', 'web_client'),
            is_simulated=item.get('is_simulated', True)
        )
        db.session.add(reading)
        created_records.append(reading)

    db.session.commit()
    return success_response(
        {'saved_count': len(created_records), 'latest': created_records[-1].to_dict()},
        message=f"Successfully ingested {len(created_records)} vital reading(s).",
        status_code=201
    )

@vitals_bp.route('/latest', methods=['GET'])
@require_auth
def get_latest_vitals():
    reading = VitalReading.query.filter_by(
        user_id=g.current_user.id
    ).order_by(VitalReading.timestamp.desc()).first()

    if not reading:
        return success_response(None, message="No readings recorded for user.")

    return success_response(reading.to_dict(), message="Latest vital reading retrieved.")

@vitals_bp.route('/history', methods=['GET'])
@require_auth
def get_vitals_history():
    limit = min(int(request.args.get('limit', 100)), 1000)
    query = VitalReading.query.filter_by(user_id=g.current_user.id)

    start_param = request.args.get('start')
    end_param = request.args.get('end')
    if start_param:
        try:
            start_dt = datetime.fromisoformat(start_param.replace('Z', '+00:00'))
            query = query.filter(VitalReading.timestamp >= start_dt)
        except ValueError:
            pass
    if end_param:
        try:
            end_dt = datetime.fromisoformat(end_param.replace('Z', '+00:00'))
            query = query.filter(VitalReading.timestamp <= end_dt)
        except ValueError:
            pass

    readings = query.order_by(VitalReading.timestamp.desc()).limit(limit).all()
    # Reverse so frontend chart receives chronological left-to-right sequence
    chronological = [r.to_dict() for r in reversed(readings)]
    return success_response(chronological, message=f"Retrieved {len(chronological)} historical readings.")

@vitals_bp.route('/statistics', methods=['GET'])
@require_auth
def get_vital_statistics():
    readings = VitalReading.query.filter(
        VitalReading.user_id == g.current_user.id,
        VitalReading.heart_rate.isnot(None)
    ).order_by(VitalReading.timestamp.desc()).limit(200).all()

    if not readings:
        return success_response({'sample_count': 0, 'status': 'no_data'})

    hr_vals = [r.heart_rate for r in readings]
    spo2_vals = [r.spo2 for r in readings if r.spo2 is not None]

    stats = {
        'sample_count': len(readings),
        'heart_rate': {
            'min': min(hr_vals),
            'max': max(hr_vals),
            'avg': round(sum(hr_vals) / len(hr_vals), 1),
            'latest': hr_vals[0]
        },
        'spo2': {
            'min': min(spo2_vals) if spo2_vals else None,
            'max': max(spo2_vals) if spo2_vals else None,
            'avg': round(sum(spo2_vals) / len(spo2_vals), 1) if spo2_vals else None,
            'latest': spo2_vals[0] if spo2_vals else None
        }
    }
    return success_response(stats, message="Vital telemetry statistics calculated.")
