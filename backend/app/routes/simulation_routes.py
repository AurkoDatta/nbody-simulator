"""Simulation CRUD endpoints, scoped to the authenticated user.

Every route requires a valid JWT; the user id embedded in that token is
what simulation_service uses to filter/own each document, so one user
can never see, rename, or delete another user's simulations.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services import simulation_service

simulation_bp = Blueprint('simulations', __name__)


@simulation_bp.route('', methods=['POST'])
@jwt_required()
def create_simulation():
    result = simulation_service.create_simulation(request.get_json(force=True) or {}, get_jwt_identity())
    return jsonify(result), 201


@simulation_bp.route('', methods=['GET'])
@jwt_required()
def list_simulations():
    return jsonify(simulation_service.list_simulations(get_jwt_identity()))


@simulation_bp.route('/<simulation_id>', methods=['GET'])
@jwt_required()
def get_simulation(simulation_id):
    return jsonify(simulation_service.get_simulation(simulation_id, get_jwt_identity()))


@simulation_bp.route('/<simulation_id>', methods=['PUT'])
@jwt_required()
def update_simulation(simulation_id):
    result = simulation_service.update_simulation(
        simulation_id, get_jwt_identity(), request.get_json(force=True) or {}
    )
    return jsonify(result)


@simulation_bp.route('/<simulation_id>', methods=['DELETE'])
@jwt_required()
def delete_simulation(simulation_id):
    simulation_service.delete_simulation(simulation_id, get_jwt_identity())
    return '', 204
