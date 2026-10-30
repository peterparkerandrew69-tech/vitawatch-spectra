from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, g
from app.extensions import db
from app.models.vital_reading import VitalReading
from app.models.activity import ActivityEvent
from app.models.device import Device
from app.services.ml_service import MLAnalyticsService
from app.utils.decorators import require_auth
from app.utils.responses import success_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@require_auth
def get_dashboard_summary():
    user = g.current_user

    # Fetch latest reading
    latest = VitalReading.query.filter_by(user_id=user.id).order_by(VitalReading.timestamp.desc()).first()

    # Calculate real-time indicators
    stress_info = MLAnalyticsService.estimate_stress(user.id)
    baseline_info = MLAnalyticsService.calculate_personalized_baseline(user.id)

    # Compile structured vitals
    hr_val = latest.heart_rate if latest and latest.heart_rate else 72.0
    spo2_val = latest.spo2 if latest and latest.spo2 else 98.0
    bp_sys = latest.blood_pressure_sys if latest and latest.blood_pressure_sys else 118
    bp_dia = latest.blood_pressure_dia if latest and latest.blood_pressure_dia else 76
    temp_val = latest.temperature if latest and latest.temperature else 98.4
    stress_val = stress_info.get('score', 28)

    # Check data provenance
    is_live_sensor = bool(latest and not latest.is_simulated and latest.data_source in ('esp32_sensor', 'ble_companion'))

    # Calculate Composite Wellness Score
    # 100 - penalties for HR out of bounds, SpO2 drop, stress
    wellness_base = 100.0
    if hr_val > 100 or hr_val < 50:
        wellness_base -= 10
    if spo2_val < 95:
        wellness_base -= (95 - spo2_val) * 3
    if stress_val > 60:
        wellness_base -= (stress_val - 60) * 0.4
    wellness_score = max(40, min(99, round(wellness_base)))

    vitals_cards = [
        {'label': 'Heart Rate', 'value': f"{int(hr_val)}", 'unit': 'BPM', 'icon': 'heart', 'color': '#FF3366', 'trend': 'stable', 'status': 'Normal' if 55 <= hr_val <= 100 else 'Warning'},
        {'label': 'Blood Oxygen', 'value': f"{int(spo2_val)}", 'unit': '% SpO2', 'icon': 'wind', 'color': '#00D4FF', 'trend': 'up', 'status': 'Optimal' if spo2_val >= 96 else 'Low'},
        {'label': 'Blood Pressure', 'value': f"{int(bp_sys)}/{int(bp_dia)}", 'unit': 'mmHg', 'icon': 'activity', 'color': '#A855F7', 'trend': 'stable', 'status': 'Normal'},
        {'label': 'Temperature', 'value': f"{temp_val:.1f}", 'unit': '°F', 'icon': 'thermometer', 'color': '#FFB800', 'trend': 'stable', 'status': 'Normal'},
        {'label': 'Stress Biomarker', 'value': f"{stress_val}", 'unit': '% Cortisol', 'icon': 'brain', 'color': '#06FDD8', 'trend': 'down', 'status': stress_info.get('level', 'Low')},
        {'label': 'Sleep Hygiene', 'value': '88', 'unit': '/100 Index', 'icon': 'moon', 'color': '#6366F1', 'trend': 'up', 'status': 'Restorative'},
    ]

    # Primary connected device
    device = Device.query.filter_by(user_id=user.id).first()
    device_info = device.to_dict() if device else {
        'name': 'VitaWatch Ultra Titanium',
        'device_type': 'esp32_gateway',
        'status': 'connected',
        'battery_level': 88,
        'firmware_version': 'v3.0.4-spectra'
    }

    # Recent ECG array (last 60 data points)
    recent_readings = VitalReading.query.filter_by(user_id=user.id).order_by(VitalReading.timestamp.desc()).limit(60).all()
    ecg_points = [r.heart_rate for r in reversed(recent_readings) if r.heart_rate] if recent_readings else [70, 72, 71, 74, 72, 73, 75, 72]

    response_payload = {
        'vitals': vitals_cards,
        'wellness_score': wellness_score,
        'ecg_points': ecg_points,
        'device': device_info,
        'data_provenance': {
            'is_live': is_live_sensor,
            'source': latest.data_source if latest else 'system_demo',
            'last_reading_time': latest.timestamp.isoformat() if latest else None,
            'status_label': 'LIVE SENSOR DATA' if is_live_sensor else 'DEMO / SIMULATED DATA'
        },
        'baseline': baseline_info
    }
    return success_response(response_payload, message="Dashboard summary loaded.")

@dashboard_bp.route('/activity', methods=['GET'])
@require_auth
def get_dashboard_activity():
    activities = ActivityEvent.query.filter_by(user_id=g.current_user.id).order_by(ActivityEvent.timestamp.desc()).limit(20).all()
    return success_response([a.to_dict() for a in activities], message="Activity chronology retrieved.")
