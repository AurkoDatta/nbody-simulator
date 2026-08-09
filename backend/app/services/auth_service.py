"""Registration and login business logic: password hashing/verification
and the corresponding MongoDB lookups. Kept separate from auth_routes.py
so the HTTP layer stays a thin translation from request to response.
"""

import re

from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import get_db
from app.models.user_model import document_from_registration, serialize_user
from app.utils.errors import ApiError

# Deliberately permissive: format validation catches typos, not RFC 5322
# edge cases -- real deliverability is proven by receiving mail, not regex.
_EMAIL_PATTERN = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MIN_PASSWORD_LENGTH = 8


def register(name, email, password):
    if not name or not email or not password:
        raise ApiError('Name, email, and password are required.', 400, 'invalid_request')
    if not _EMAIL_PATTERN.match(email):
        raise ApiError('Enter a valid email address.', 422, 'invalid_email')
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ApiError(f'Password must be at least {MIN_PASSWORD_LENGTH} characters.', 422, 'weak_password')

    db = get_db()
    if db.users.find_one({'email': email}):
        raise ApiError('An account with this email already exists.', 409, 'email_taken')

    password_hash = generate_password_hash(password)
    doc = document_from_registration(name, email, password_hash)
    doc['_id'] = db.users.insert_one(doc).inserted_id

    token = create_access_token(identity=str(doc['_id']))
    return {'token': token, 'user': serialize_user(doc)}


def login(email, password):
    if not email or not password:
        raise ApiError('Email and password are required.', 400, 'invalid_request')

    db = get_db()
    doc = db.users.find_one({'email': email})
    if doc is None or not check_password_hash(doc['passwordHash'], password):
        raise ApiError('Invalid email or password.', 401, 'invalid_credentials')

    token = create_access_token(identity=str(doc['_id']))
    return {'token': token, 'user': serialize_user(doc)}
