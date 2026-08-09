"""Serves metadata and generated body configs for the built-in presets
exposed at GET /api/presets.
"""

from app.physics.presets import figure_eight, random_cluster, solar_system_like

_PRESETS = [
    {
        'name': 'figure_eight',
        'label': 'Figure-Eight Orbit',
        'description': 'Three equal masses chasing each other around a stable figure-eight path.',
        'generator': figure_eight,
    },
    {
        'name': 'solar_system',
        'label': 'Simplified Solar System',
        'description': 'A central star with a few planets on circular orbits.',
        'generator': solar_system_like,
    },
    {
        'name': 'random_cluster',
        'label': 'Random Cluster',
        'description': 'A loose cluster of randomly placed bodies for chaotic dynamics.',
        'generator': random_cluster,
    },
]


def list_presets():
    """Return preset metadata plus the generated body list for each
    built-in preset, ready to serialize as JSON."""
    return [
        {
            'name': preset['name'],
            'label': preset['label'],
            'description': preset['description'],
            'bodies': preset['generator'](),
        }
        for preset in _PRESETS
    ]
