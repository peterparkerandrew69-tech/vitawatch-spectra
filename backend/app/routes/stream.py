import time
import json
from flask import Blueprint, Response, request, stream_with_context
from app.models.user import User
from app.models.vital_reading import VitalReading
from app.models.emergency_event import EmergencyEvent
from app.models.device import Device
from app.utils.auth import decode_token
from app.services.ml_service import MLAnalyticsService
from datetime import datetime, timezone

stream_bp = Blueprint("stream", __name__, url_prefix="/api/stream")

@stream_bp.route("/vitals", methods=["GET"])
def stream_vitals():
    """
    Server-Sent Events (SSE) live telemetry stream.
    Authenticates via Authorization header or ?token= query parameter (for browser EventSource).
    Streams live vital readings, emergency flags, and device connectivity in real time.
    """
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif request.args.get("token"):
        token = request.args.get("token")

    if not token:
        # If no token provided in demo exploration, allow a demo stream
        user_id = 1
        user = User.query.first()
    else:
        payload = decode_token(token)
        if not payload:
            return Response("data: {\"error\": \"Unauthorized or expired token\"}\n\n", mimetype="text/event-stream", status=401)
        user_id = payload.get("user_id")
        user = User.query.get(user_id)

    def generate_events():
        last_reading_id = None
        tick = 0

        while True:
            try:
                # Query latest reading for this user
                latest = VitalReading.query.filter_by(user_id=user_id)\
                    .order_by(VitalReading.timestamp.desc()).first()

                # Query any active emergencies
                active_emergency = EmergencyEvent.query.filter(
                    EmergencyEvent.user_id == user_id,
                    EmergencyEvent.status.in_(["detected", "alerting", "confirmed"])
                ).order_by(EmergencyEvent.created_at.desc()).first()

                # Check device status
                device = Device.query.filter_by(user_id=user_id).first()
                device_status = device.status if device else "offline"

                # Check freshness
                is_fresh = False
                if latest and latest.timestamp:
                    age_seconds = (datetime.now(timezone.utc) - latest.timestamp).total_seconds()
                    is_fresh = age_seconds < 15

                # Provenance
                provenance = "LIVE_SENSOR" if (latest and not latest.is_simulated and is_fresh) else \
                             "CONNECTED_NO_RECENT" if (latest and not latest.is_simulated and not is_fresh) else \
                             "DEMO_SIMULATION"

                # Estimate stress non-diagnostically
                stress_info = MLAnalyticsService.estimate_stress(user_id, [latest] if latest else None)

                payload_data = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "heart_rate": latest.heart_rate if latest else 74,
                    "spo2": latest.spo2 if latest else 98.4,
                    "skin_temp_c": latest.skin_temp_c if latest else 36.6,
                    "gsr": latest.gsr if latest else 1.25,
                    "accel": {
                        "x": latest.accel_x if latest else 0.02,
                        "y": latest.accel_y if latest else 0.01,
                        "z": latest.accel_z if latest else 0.98
                    },
                    "gyro": {
                        "x": latest.gyro_x if latest else 0.0,
                        "y": latest.gyro_y if latest else 0.0,
                        "z": latest.gyro_z if latest else 0.0
                    },
                    "signal_quality": latest.signal_quality if latest else 0.95,
                    "provenance": provenance,
                    "is_simulated": latest.is_simulated if latest else True,
                    "is_fresh": is_fresh,
                    "device_status": device_status,
                    "active_emergency": active_emergency.to_dict() if active_emergency else None,
                    "stress": stress_info,
                    "tick": tick
                }

                yield f"data: {json.dumps(payload_data)}\n\n"
                tick += 1
                time.sleep(1.0)
            except GeneratorExit:
                break
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                time.sleep(3.0)

    return Response(
        stream_with_context(generate_events()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
