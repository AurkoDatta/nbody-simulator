"""GET /api/presets -- lists the built-in simulation starting points."""

from flask import Blueprint, jsonify

from app.services.preset_service import list_presets

preset_bp = Blueprint('presets', __name__)


@preset_bp.route('/presets', methods=['GET'])
def get_presets():
    return jsonify(list_presets())
