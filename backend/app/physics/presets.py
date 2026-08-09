"""Built-in initial conditions for the simulation builder's preset picker.

Each preset returns a list of body dicts (mass, position, velocity,
color, label) using the same normalized/simulation-friendly units as the
rest of the app (G assumed to be 1.0) -- these are meant to be a starting
point a user can then edit in the builder, not a fixed physical scenario.
"""

import numpy as np


def figure_eight():
    """The Chenciner-Montgomery figure-eight three-body orbit: three
    equal masses chase each other around a single figure-eight-shaped
    path forever. It's a famous example of a stable, non-trivial periodic
    solution to the three-body problem. The specific initial conditions
    below are the standard published values and assume G=1.
    """
    p1 = np.array([0.97000436, -0.24308753])
    p2 = -p1
    p3 = np.array([0.0, 0.0])
    v3 = np.array([-0.93240737, -0.86473146])
    v1 = -v3 / 2
    v2 = -v3 / 2

    return [
        {'mass': 1.0, 'position': {'x': p1[0], 'y': p1[1]}, 'velocity': {'vx': v1[0], 'vy': v1[1]}, 'color': '#4C6EF5', 'label': 'Alpha'},
        {'mass': 1.0, 'position': {'x': p2[0], 'y': p2[1]}, 'velocity': {'vx': v2[0], 'vy': v2[1]}, 'color': '#FF8A3D', 'label': 'Beta'},
        {'mass': 1.0, 'position': {'x': p3[0], 'y': p3[1]}, 'velocity': {'vx': v3[0], 'vy': v3[1]}, 'color': '#7CF29C', 'label': 'Gamma'},
    ]


def solar_system_like():
    """A simplified, not-to-scale solar-system analogue: one massive
    central body plus a few lighter bodies on circular orbits at
    increasing radii. Assumes G=1; orbital speeds are derived from the
    circular-orbit condition v = sqrt(G*M/r) so the planets start in
    stable orbits rather than arbitrary ones.
    """
    G = 1.0
    star_mass = 1000.0
    bodies = [
        {'mass': star_mass, 'position': {'x': 0.0, 'y': 0.0}, 'velocity': {'vx': 0.0, 'vy': 0.0}, 'color': '#FF8A3D', 'label': 'Star'},
    ]
    planet_specs = [
        (10.0, 1.0, '#4C6EF5', 'Planet I'),
        (18.0, 2.0, '#7CF29C', 'Planet II'),
        (28.0, 1.5, '#E8ECF7', 'Planet III'),
    ]
    for radius, mass, color, label in planet_specs:
        speed = np.sqrt(G * star_mass / radius)
        bodies.append({
            'mass': mass,
            'position': {'x': radius, 'y': 0.0},
            'velocity': {'vx': 0.0, 'vy': speed},
            'color': color,
            'label': label,
        })
    return bodies


def random_cluster(count=6, seed=None):
    """A loose cluster of bodies with randomized mass/position/velocity,
    for exploring chaotic many-body behavior rather than a stable orbit.
    seed is accepted (and left unset by default) so tests can request a
    reproducible cluster.
    """
    rng = np.random.default_rng(seed)
    colors = ['#4C6EF5', '#FF8A3D', '#7CF29C', '#E8ECF7', '#6B7488', '#A78BFA', '#F472B6', '#38BDF8', '#FACC15', '#34D399']

    bodies = []
    for i in range(count):
        angle = rng.uniform(0, 2 * np.pi)
        radius = rng.uniform(2.0, 10.0)
        position = (radius * np.cos(angle), radius * np.sin(angle))
        velocity = rng.uniform(-0.3, 0.3, size=2)
        mass = rng.uniform(1.0, 5.0)
        bodies.append({
            'mass': float(mass),
            'position': {'x': float(position[0]), 'y': float(position[1])},
            'velocity': {'vx': float(velocity[0]), 'vy': float(velocity[1])},
            'color': colors[i % len(colors)],
            'label': f'Body {i + 1}',
        })
    return bodies
