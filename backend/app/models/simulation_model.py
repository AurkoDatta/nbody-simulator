"""Helpers for translating between API-facing simulation config data and
the MongoDB document stored in the `simulations` collection.
"""

from datetime import datetime, timezone


def document_from_request(data, user_id):
    """Build a `simulations` document from a validated creation payload.
    Only the fields the frontend builder actually sends are stored;
    physics defaults (G, softening, merge distance) are applied here so
    every stored document is self-describing.
    """
    return {
        'userId': user_id,
        'name': data.get('name') or 'Untitled Simulation',
        'bodies': data['bodies'],
        'gConstant': data.get('gConstant', 1.0),
        'softening': data.get('softening', 0.01),
        'mergeDistance': data.get('mergeDistance', 0.05),
        'duration': data['duration'],
        'timestep': data['timestep'],
        'createdAt': datetime.now(timezone.utc),
    }


def serialize_summary(doc):
    """Metadata-only view for the simulation list endpoint -- explicitly
    excludes trajectory data (that lives in a separate collection and is
    only fetched for a single simulation at a time)."""
    return {
        'id': str(doc['_id']),
        'name': doc['name'],
        'bodyCount': len(doc['bodies']),
        'duration': doc['duration'],
        'timestep': doc['timestep'],
        'createdAt': doc['createdAt'].isoformat(),
    }


def serialize_full(doc, result_doc):
    """Full config plus trajectory view, for a single simulation's
    playback page. result_doc may be None if no result was ever stored
    (shouldn't normally happen, but keeps this defensive)."""
    return {
        'id': str(doc['_id']),
        'name': doc['name'],
        'bodies': doc['bodies'],
        'gConstant': doc['gConstant'],
        'softening': doc['softening'],
        'mergeDistance': doc['mergeDistance'],
        'duration': doc['duration'],
        'timestep': doc['timestep'],
        'createdAt': doc['createdAt'].isoformat(),
        'frames': result_doc['frames'] if result_doc else [],
        'frameCount': result_doc['frameCount'] if result_doc else 0,
        'summary': result_doc['summary'] if result_doc else None,
    }
