from flask import Blueprint, request
from app.extensions import db
from app.models.notification import NotificationDelivery
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response
from datetime import datetime, timezone

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@require_auth
def list_notifications(current_user):
    """
    Returns authenticated user's notification audit log.
    Accurately indicates delivery status (e.g. 'delivered' vs 'not_configured').
    """
    limit = min(int(request.args.get("limit", 25)), 100)
    notifications = NotificationDelivery.query.filter_by(user_id=current_user.id)\
        .order_by(NotificationDelivery.attempted_at.desc()).limit(limit).all()

    return success_response([n.to_dict() for n in notifications], "Notifications retrieved")

@notifications_bp.route("/<int:notification_id>/read", methods=["POST"])
@require_auth
def mark_read(current_user, notification_id):
    """
    Marks a notification as read.
    """
    notif = NotificationDelivery.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if not notif:
        return error_response("Notification not found", 404)

    notif.read_at = datetime.now(timezone.utc)
    db.session.commit()
    return success_response(notif.to_dict(), "Notification marked as read")
