"""Simulation CRUD endpoints.

NOTE: authentication is added in a later phase (see auth_routes.py / the
Flask-JWT-Extended setup). Until then, every request is attributed to a
fixed placeholder user id so these endpoints -- and their ownership-
scoped queries -- can be built and tested end-to-end now. Wiring in real
auth later is a matter of swapping where this id comes from (a JWT
claim instead of a constant), not rewriting the service layer.
"""

from flask import Blueprint, jsonify, request

from app.services import simulation_service

simulation_bp = Blueprint('simulations', __name__)

_PLACEHOLDER_USER_ID = 'dev-user'


@simulation_bp.route('', methods=['POST'])
def create_simulation():
    result = simulation_service.create_simulation(request.get_json(force=True) or {}, _PLACEHOLDER_USER_ID)
    return jsonify(result), 201


@simulation_bp.route('', methods=['GET'])
def list_simulations():
    return jsonify(simulation_service.list_simulations(_PLACEHOLDER_USER_ID))


@simulation_bp.route('/<simulation_id>', methods=['GET'])
def get_simulation(simulation_id):
    return jsonify(simulation_service.get_simulation(simulation_id, _PLACEHOLDER_USER_ID))


@simulation_bp.route('/<simulation_id>', methods=['PUT'])
def update_simulation(simulation_id):
    result = simulation_service.update_simulation(
        simulation_id, _PLACEHOLDER_USER_ID, request.get_json(force=True) or {}
    )
    return jsonify(result)


@simulation_bp.route('/<simulation_id>', methods=['DELETE'])
def delete_simulation(simulation_id):
    simulation_service.delete_simulation(simulation_id, _PLACEHOLDER_USER_ID)
    return '', 204
