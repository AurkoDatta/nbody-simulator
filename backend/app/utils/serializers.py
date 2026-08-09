"""Conversion helpers between raw NumPy simulation output / Mongo
ObjectIds and JSON-serializable structures for the API layer.
"""

import numpy as np
from bson import ObjectId
from bson.errors import InvalidId

from app.utils.errors import ApiError


def serialize_frame(frame):
    """Convert one raw physics frame (NumPy arrays, as produced by
    app.physics.nbody.run_simulation) into the JSON-ready shape used for
    storage/playback: positions keyed by body id, so the frontend can
    track a body across frames even as collisions change how many bodies
    exist. Momentum is reduced to its magnitude, since that's the only
    thing the diagnostics chart and live readout need.
    """
    return {
        't': frame['t'],
        'bodies': [
            {'id': body_id, 'x': float(pos[0]), 'y': float(pos[1])}
            for body_id, pos in zip(frame['ids'], frame['positions'])
        ],
        'energy': float(frame['energy']),
        'momentum': float(np.linalg.norm(frame['momentum'])),
    }


def parse_object_id(id_str):
    """Parse a request-supplied string into an ObjectId, raising the
    standard API error shape (rather than letting bson's exception leak
    out as a 500) if it isn't a valid id."""
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise ApiError('Invalid simulation id.', 400, 'invalid_id')
