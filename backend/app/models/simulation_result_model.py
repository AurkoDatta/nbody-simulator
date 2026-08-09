"""Helpers for the `simulationResults` collection.

Kept as a separate collection (and separate model module) from
`simulations` because trajectory frame data is large and shouldn't bloat
the lightweight config document that the list endpoint reads.
"""

from datetime import datetime, timezone


def document_from_frames(simulation_id, downsampled_frames, summary):
    return {
        'simulationId': simulation_id,
        'frames': downsampled_frames,
        'frameCount': len(downsampled_frames),
        'summary': summary,
        'createdAt': datetime.now(timezone.utc),
    }
