"""POST /api/auth/register, POST /api/auth/login."""

from flask import Blueprint, jsonify, request

from app.services import auth_service

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True) or {}
    result = auth_service.register(data.get('name'), data.get('email'), data.get('password'))
    return jsonify(result), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    result = auth_service.login(data.get('email'), data.get('password'))
    return jsonify(result)
