from flask import Blueprint, request
from app.extensions import db
from app.models.vital_reading import VitalReading
from app.models.cognitive_session import CognitiveSession
from app.models.activity import ActivityEvent
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response
from app.services.ml_service import MLAnalyticsService
from datetime import datetime, timedelta, timezone

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/summary", methods=["GET"])
@require_auth
def get_analytics_summary(current_user):
    """
    Returns non-diagnostic wellness indicators derived from real persisted data or statistical baselines.
    """
    recent_readings = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).limit(100).all()
    
    recent_sessions = CognitiveSession.query.filter_by(user_id=current_user.id)\
        .order_by(CognitiveSession.completed_at.desc()).limit(20).all()

    summary = MLAnalyticsService.compute_comprehensive_summary(
        user=current_user,
        readings=recent_readings,
        cognitive_sessions=recent_sessions
    )

    return success_response(summary, "Analytics summary computed")

@analytics_bp.route("/stress", methods=["GET"])
@require_auth
def get_stress_analysis(current_user):
    """
    Returns non-diagnostic stress estimation derived from HRV baseline, GSR, and heart rate.
    """
    recent_readings = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).limit(60).all()

    analysis = MLAnalyticsService.estimate_stress(current_user, recent_readings)
    return success_response(analysis, "Stress analysis retrieved")

@analytics_bp.route("/fatigue", methods=["GET"])
@require_auth
def get_fatigue_analysis(current_user):
    """
    Returns fatigue index derived from reaction times and movement stability.
    """
    recent_sessions = CognitiveSession.query.filter_by(user_id=current_user.id)\
        .order_by(CognitiveSession.completed_at.desc()).limit(15).all()
    recent_readings = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).limit(60).all()

    analysis = MLAnalyticsService.estimate_fatigue(current_user, recent_sessions, recent_readings)
    return success_response(analysis, "Fatigue analysis retrieved")

@analytics_bp.route("/movement", methods=["GET"])
@require_auth
def get_movement_analysis(current_user):
    """
    Returns movement stability metrics from IMU accelerometer and gyroscope sensor readings.
    """
    recent_readings = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).limit(60).all()

    analysis = MLAnalyticsService.analyze_movement(recent_readings)
    return success_response(analysis, "Movement stability analysis retrieved")

@analytics_bp.route("/trends", methods=["GET"])
@require_auth
def get_trends(current_user):
    """
    Weekly and daily trends across physiological metrics.
    """
    days = int(request.args.get("days", 7))
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    readings = VitalReading.query.filter(
        VitalReading.user_id == current_user.id,
        VitalReading.timestamp >= since
    ).order_by(VitalReading.timestamp.asc()).all()

    trends = MLAnalyticsService.compute_historical_trends(readings)
    return success_response(trends, f"Trends for the past {days} days")

@analytics_bp.route("/confidence", methods=["GET"])
@require_auth
def get_confidence_metrics(current_user):
    """
    Exposes input data quality, model availability, and confidence calibration.
    """
    recent_readings = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).limit(30).all()

    confidence = MLAnalyticsService.get_confidence_audit(recent_readings)
    return success_response(confidence, "Analytics confidence audit retrieved")

@analytics_bp.route("/infer", methods=["POST"])
@require_auth
def run_custom_inference(current_user):
    """
    Allows validated feature vector inference.
    """
    data = request.get_json() or {}
    features = data.get("features", {})
    if not features:
        return error_response("Features dictionary is required", 400)

    result = MLAnalyticsService.custom_inference(features)
    return success_response(result, "Inference completed")

@analytics_bp.route("/chat", methods=["POST"])
@require_auth
def chat_copilot(current_user):
    """
    Context-aware AI Copilot. Distinguishes verified personal telemetry from
    general educational wellness suggestions. Never claims to provide diagnostic advice.
    """
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    if not message:
        return error_response("Message cannot be empty", 400)

    # Fetch latest user telemetry for context
    latest_reading = VitalReading.query.filter_by(user_id=current_user.id)\
        .order_by(VitalReading.timestamp.desc()).first()

    response_text = MLAnalyticsService.generate_copilot_response(
        user=current_user,
        message=message,
        latest_reading=latest_reading
    )

    return success_response({
        "reply": response_text,
        "disclaimer": "VitaWatch Spectra Copilot provides general physiological insights and educational wellness guidance. It is not a medical device and cannot diagnose or treat medical conditions.",
        "context_timestamp": datetime.now(timezone.utc).isoformat()
    }, "Copilot response generated")
