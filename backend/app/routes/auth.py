from flask import Blueprint, request, make_response, g
from app.extensions import db
from app.models.user import User
from app.utils.auth import generate_token
from app.utils.decorators import require_auth
from app.utils.responses import success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role = data.get('role', 'patient')

    if not email or '@' not in email:
        return error_response('A valid email address is required.', status_code=400)
    if not password or len(password) < 6:
        return error_response('Password must be at least 6 characters long.', status_code=400)
    if not full_name:
        return error_response('Full name is required.', status_code=400)

    if User.query.filter_by(email=email).first():
        return error_response('An account with this email already exists.', status_code=409)

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        age=data.get('age', 24),
        height=data.get('height', "5'10\""),
        weight=data.get('weight', "72 kg"),
        blood_group=data.get('blood_group', "O+")
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    response_data = {
        'token': token,
        'user': user.to_dict()
    }
    resp = make_response(success_response(response_data, message="Registration successful.", status_code=201))
    resp.set_cookie('auth_token', token, httponly=True, samesite='Lax', max_age=86400)
    return resp

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error_response('Email and password are required.', status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response('Invalid email or password credentials.', status_code=401)

    token = generate_token(user.id, user.role)
    response_data = {
        'token': token,
        'user': user.to_dict()
    }
    resp = make_response(success_response(response_data, message="Login successful."))
    resp.set_cookie('auth_token', token, httponly=True, samesite='Lax', max_age=86400)
    return resp

@auth_bp.route('/logout', methods=['POST'])
def logout():
    resp = make_response(success_response(None, message="Logged out successfully."))
    resp.delete_cookie('auth_token')
    return resp

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    return success_response(g.current_user.to_dict(), message="User profile retrieved.")

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    data = request.get_json(silent=True) or {}
    user = g.current_user

    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'age' in data:
        try:
            user.age = int(data['age'])
        except ValueError:
            pass
    if 'height' in data:
        user.height = str(data['height'])
    if 'weight' in data:
        user.weight = str(data['weight'])
    if 'blood_group' in data:
        user.blood_group = str(data['blood_group'])

    db.session.commit()
    return success_response(user.to_dict(), message="Profile updated successfully.")
