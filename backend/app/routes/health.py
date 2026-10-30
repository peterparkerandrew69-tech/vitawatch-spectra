from flask import Blueprint, jsonify, current_app
from app.extensions import db
from sqlalchemy import text

health_bp = Blueprint('health', __name__, url_prefix='/api')

@health_bp.route('/health', methods=['GET'])
def get_health():
    db_status = "connected"
    try:
        db.session.execute(text("SELECT 1"))
    except Exception as e:
        current_app.logger.error(f"Health check DB error: {e}")
        db_status = "error_disconnected"

    mode = current_app.config.get('APP_MODE', 'demo')

    return jsonify({
        "status": "ok" if db_status == "connected" else "degraded",
        "application": "VitaWatch Spectra",
        "backend": "running",
        "database": db_status,
        "mode": mode,
        "telemetry_stream": "active",
        "hardware_gateway": "ready"
    }), 200
