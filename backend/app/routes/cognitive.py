from flask import Blueprint, request
from app.extensions import db
from app.models.cognitive_session import CognitiveSession
from app.models.user import User
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response
from datetime import datetime, timezone

cognitive_bp = Blueprint("cognitive", __name__, url_prefix="/api/cognitive")

@cognitive_bp.route("/sessions", methods=["POST"])
@require_auth
def create_session(current_user):
    """
    Records a completed cognitive or motor challenge trial.
    Validates reaction time and score ranges to prevent spoofed leaderboard scores.
    """
    data = request.get_json() or {}
    task_type = data.get("task_type", "reaction_speed")
    difficulty = data.get("difficulty", "medium")
    reaction_time = data.get("reaction_time_ms")
    score = data.get("score", 0)
    accuracy = data.get("accuracy_percent")
    notes = data.get("notes")

    # Validation
    if reaction_time is not None:
        try:
            reaction_time = float(reaction_time)
            # Physiological human limits: simple reaction time is almost never < 100ms
            if reaction_time < 100 or reaction_time > 10000:
                return error_response("Invalid reaction time. Human reaction times must be between 100ms and 10000ms", 400)
        except (ValueError, TypeError):
            return error_response("reaction_time_ms must be numeric", 400)

    if score is not None:
        try:
            score = int(score)
            if score < 0 or score > 100000:
                return error_response("Score out of realistic bounds", 400)
        except (ValueError, TypeError):
            return error_response("score must be an integer", 400)

    session = CognitiveSession(
        user_id=current_user.id,
        task_type=task_type,
        difficulty=difficulty,
        reaction_time_ms=reaction_time,
        score=score,
        accuracy_percent=accuracy,
        notes=notes,
        is_completed=True,
        completed_at=datetime.now(timezone.utc)
    )

    db.session.add(session)
    db.session.commit()

    return success_response(session.to_dict(), "Cognitive session recorded successfully", 201)

@cognitive_bp.route("/sessions", methods=["GET"])
@require_auth
def list_sessions(current_user):
    """
    Returns authenticated user's cognitive sessions.
    """
    task_type = request.args.get("task_type")
    limit = min(int(request.args.get("limit", 20)), 100)

    query = CognitiveSession.query.filter_by(user_id=current_user.id)
    if task_type:
        query = query.filter_by(task_type=task_type)

    sessions = query.order_by(CognitiveSession.completed_at.desc()).limit(limit).all()
    return success_response([s.to_dict() for s in sessions], "Cognitive sessions retrieved")

@cognitive_bp.route("/leaderboard", methods=["GET"])
@require_auth
def get_leaderboard(current_user):
    """
    Returns top reaction time / cognitive scores across authorized users.
    Anonymizes sensitive user details while validating integrity.
    """
    task_type = request.args.get("task_type", "reaction_speed")
    top_sessions = CognitiveSession.query.filter(
        CognitiveSession.task_type == task_type,
        CognitiveSession.reaction_time_ms.isnot(None),
        CognitiveSession.reaction_time_ms >= 120.0  # Filter sub-human anomalies
    ).order_by(CognitiveSession.reaction_time_ms.asc()).limit(15).all()

    leaderboard = []
    for rank, s in enumerate(top_sessions, 1):
        user = User.query.get(s.user_id)
        display_name = f"{user.first_name} {user.last_name[0]}." if user and user.first_name and user.last_name else "Spectra Athlete"
        leaderboard.append({
            "rank": rank,
            "session_id": s.id,
            "display_name": display_name,
            "is_current_user": (s.user_id == current_user.id),
            "reaction_time_ms": s.reaction_time_ms,
            "score": s.score,
            "difficulty": s.difficulty,
            "date": s.completed_at.strftime("%Y-%m-%d %H:%M") if s.completed_at else None
        })

    return success_response(leaderboard, "Cognitive leaderboard retrieved")

@cognitive_bp.route("/sessions/<int:session_id>/complete", methods=["POST"])
@require_auth
def complete_session(current_user, session_id):
    """
    Marks an in-progress session as completed with final scores.
    """
    session = CognitiveSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return error_response("Cognitive session not found", 404)

    data = request.get_json() or {}
    session.reaction_time_ms = data.get("reaction_time_ms", session.reaction_time_ms)
    session.score = data.get("score", session.score)
    session.accuracy_percent = data.get("accuracy_percent", session.accuracy_percent)
    session.is_completed = True
    session.completed_at = datetime.now(timezone.utc)

    db.session.commit()
    return success_response(session.to_dict(), "Session marked as complete")
