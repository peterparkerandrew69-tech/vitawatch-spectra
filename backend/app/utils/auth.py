import jwt
from datetime import datetime, timezone, timedelta
from flask import current_app

def generate_token(user_id: int, role: str = 'patient', expires_in_hours: int = 24) -> str:
    payload = {
        'sub': str(user_id),
        'user_id': user_id,
        'role': role,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)
    }
    secret = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret-spectra')
    return jwt.encode(payload, secret, algorithm='HS256')

def decode_token(token: str):
    secret = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret-spectra')
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
