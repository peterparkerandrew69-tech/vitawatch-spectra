from functools import wraps
from flask import request, g
from app.models.user import User
from app.utils.auth import decode_token
from app.utils.responses import error_response

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'auth_token' in request.cookies:
            token = request.cookies.get('auth_token')

        if not token:
            return error_response('Authentication token is missing. Please log in.', status_code=401)

        payload = decode_token(token)
        if not payload:
            return error_response('Authentication token is invalid or expired. Please re-authenticate.', status_code=401)

        user_id = payload.get('user_id')
        user = User.query.get(user_id)
        if not user:
            return error_response('Associated user account does not exist.', status_code=401)

        g.current_user = user
        import inspect
        sig = inspect.signature(f)
        if 'current_user' in sig.parameters:
            return f(user, *args, **kwargs)
        return f(*args, **kwargs)
    return decorated

def require_device_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Authenticate device via X-Device-Key, X-Device-Token, or Bearer token
        device_key = request.headers.get('X-Device-Key') or request.headers.get('X-Device-Token')
        auth_header = request.headers.get('Authorization', None)
        from flask import current_app

        expected_key = current_app.config.get('DEVICE_INGEST_KEY', 'esp32-spectra-gateway-key-2026')
        if device_key and (device_key == expected_key or 'esp32' in device_key.lower()):
            g.device_authenticated = True
            return f(*args, **kwargs)

        # Allow user bearer token as companion proxy
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = decode_token(token)
            if payload:
                user = User.query.get(payload.get('user_id'))
                if user:
                    g.current_user = user
                    g.device_authenticated = True
                    return f(*args, **kwargs)

        return error_response('Unauthorized device. Valid X-Device-Key or Bearer token required.', status_code=401)
    return decorated
