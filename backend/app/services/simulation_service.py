"""Orchestrates the simulation lifecycle: validate a creation request,
run the physics engine, downsample the trajectory for storage/transport,
and persist config + result to MongoDB. Also backs the list/get/update/
delete endpoints.
"""

import numpy as np

from app.extensions import get_db
from app.models.simulation_model import document_from_request, serialize_full, serialize_summary
from app.models.simulation_result_model import document_from_frames
from app.physics.nbody import run_simulation
from app.utils.errors import ApiError
from app.utils.serializers import parse_object_id, serialize_frame
from app.utils.validators import validate_simulation_request

MAX_STORED_FRAMES = 2000


def create_simulation(data, user_id):
    """Validate the request, run the full-resolution integration, then
    downsample and persist both the config and the trajectory."""
    validate_simulation_request(data)
    bodies = data['bodies']

    positions = np.array([[b['position']['x'], b['position']['y']] for b in bodies])
    velocities = np.array([[b['velocity']['vx'], b['velocity']['vy']] for b in bodies])
    masses = np.array([b['mass'] for b in bodies])
    ids = list(range(len(bodies)))

    simulation_doc = document_from_request(data, user_id)

    raw_frames = run_simulation(
        positions, velocities, masses, ids,
        G=simulation_doc['gConstant'],
        epsilon=simulation_doc['softening'],
        duration=simulation_doc['duration'],
        timestep=simulation_doc['timestep'],
        merge_distance=simulation_doc['mergeDistance'],
    )

    summary = _compute_drift_summary(raw_frames)
    keep_indices = _downsample_frame_indices(raw_frames)
    downsampled_frames = [serialize_frame(raw_frames[i]) for i in keep_indices]

    db = get_db()
    simulation_id = db.simulations.insert_one(simulation_doc).inserted_id
    result_doc = document_from_frames(simulation_id, downsampled_frames, summary)
    db.simulation_results.insert_one(result_doc)

    simulation_doc['_id'] = simulation_id
    return serialize_full(simulation_doc, result_doc)


def list_simulations(user_id):
    db = get_db()
    docs = db.simulations.find({'userId': user_id}).sort('createdAt', -1)
    return [serialize_summary(doc) for doc in docs]


def get_simulation(simulation_id, user_id):
    db = get_db()
    doc = _find_owned_simulation(db, simulation_id, user_id)
    result_doc = db.simulation_results.find_one({'simulationId': doc['_id']})
    return serialize_full(doc, result_doc)


def update_simulation(simulation_id, user_id, updates):
    """Only the simulation's name can be changed after creation -- the
    physics config is immutable once a trajectory has been computed for
    it, so "editing" a simulation means building a new one."""
    db = get_db()
    doc = _find_owned_simulation(db, simulation_id, user_id)

    name = updates.get('name')
    if name:
        db.simulations.update_one({'_id': doc['_id']}, {'$set': {'name': name}})
        doc['name'] = name

    return serialize_summary(doc)


def delete_simulation(simulation_id, user_id):
    db = get_db()
    doc = _find_owned_simulation(db, simulation_id, user_id)
    db.simulations.delete_one({'_id': doc['_id']})
    db.simulation_results.delete_many({'simulationId': doc['_id']})


def _find_owned_simulation(db, simulation_id, user_id):
    object_id = parse_object_id(simulation_id)
    doc = db.simulations.find_one({'_id': object_id, 'userId': user_id})
    if doc is None:
        raise ApiError('Simulation not found.', 404, 'not_found')
    return doc


def _find_merge_event_indices(frames):
    """Frame indices where the body count dropped from the previous
    frame -- i.e. a collision merge happened on that step."""
    return [i for i in range(1, len(frames)) if len(frames[i]['ids']) < len(frames[i - 1]['ids'])]


def _downsample_frame_indices(frames):
    """Pick evenly spaced frame indices capped at MAX_STORED_FRAMES,
    always keeping the first/last raw step and the step immediately
    before/after any collision merge -- so a merge is never skipped over
    during playback even though most raw steps are discarded.
    """
    num_frames = len(frames)
    if num_frames <= MAX_STORED_FRAMES:
        indices = set(range(num_frames))
    else:
        indices = set(np.linspace(0, num_frames - 1, MAX_STORED_FRAMES).astype(int).tolist())

    indices.add(0)
    indices.add(num_frames - 1)
    for merge_index in _find_merge_event_indices(frames):
        indices.add(max(0, merge_index - 1))
        indices.add(merge_index)
        indices.add(min(num_frames - 1, merge_index + 1))

    return sorted(indices)


def _compute_drift_summary(frames):
    """Energy/momentum drift statistics computed from the *full*
    resolution frames, independent of the downsampling stride, so the
    diagnostics correctness signal doesn't get diluted by how much of
    the trajectory was kept for storage.
    """
    energies = [f['energy'] for f in frames]
    momentum_magnitudes = [float(np.linalg.norm(f['momentum'])) for f in frames]

    initial_energy = energies[0]
    if initial_energy != 0:
        max_relative_energy_drift = max(abs((e - initial_energy) / initial_energy) for e in energies)
    else:
        max_relative_energy_drift = max(abs(e - initial_energy) for e in energies)

    return {
        'initialEnergy': initial_energy,
        'finalEnergy': energies[-1],
        'maxRelativeEnergyDrift': max_relative_energy_drift,
        'initialMomentum': momentum_magnitudes[0],
        'finalMomentum': momentum_magnitudes[-1],
        'maxMomentumDrift': max(abs(m - momentum_magnitudes[0]) for m in momentum_magnitudes),
    }
