"""Vectorized N-body gravitational integrator.

This module is intentionally free of any Flask/Mongo dependency: every
function operates on plain NumPy arrays in, plain NumPy arrays out, so it
can be unit tested and reasoned about in isolation from the web layer.
"""

import numpy as np


def compute_accelerations(positions, masses, G, epsilon):
    """Compute the net gravitational acceleration on every body.

    positions: (N, 2) array of [x, y] per body.
    masses: (N,) array of body masses.
    G: gravitational constant.
    epsilon: softening length. Added in quadrature to the squared
        separation so that two bodies passing arbitrarily close together
        never produce a division by (near-)zero -- physically this models
        each body as having a small extended radius rather than being a
        true point mass.

    Returns an (N, 2) array of accelerations, one per body.
    """
    # diff[i, j] = position of body j minus position of body i, so the
    # vector points from i toward j -- the direction i is pulled in.
    diff = positions[np.newaxis, :, :] - positions[:, np.newaxis, :]
    dist_sq = np.sum(diff**2, axis=-1) + epsilon**2
    # The i == j diagonal is exactly 0 when epsilon == 0, which would
    # raise 0**-1.5. Set it to a harmless nonzero placeholder first; the
    # resulting value is discarded by fill_diagonal below regardless.
    np.fill_diagonal(dist_sq, 1.0)

    inv_dist_cubed = dist_sq**-1.5
    # Zero out the i == j diagonal so a body never accelerates itself.
    np.fill_diagonal(inv_dist_cubed, 0.0)

    # a_i = G * sum_j m_j * (pos_j - pos_i) / |pos_j - pos_i|^3
    return G * np.sum(masses[np.newaxis, :, None] * diff * inv_dist_cubed[:, :, None], axis=1)


def compute_energy(positions, velocities, masses, G, epsilon):
    """Total mechanical energy of the system: kinetic + gravitational potential.

    This is the primary correctness signal for the integrator -- for an
    isolated system it should stay constant over time, so tracking it at
    every step is how numerical drift (from timestep size, softening, or
    integrator error) gets surfaced to the user.
    """
    kinetic = 0.5 * np.sum(masses * np.sum(velocities**2, axis=-1))

    diff = positions[np.newaxis, :, :] - positions[:, np.newaxis, :]
    dist = np.sqrt(np.sum(diff**2, axis=-1) + epsilon**2)
    np.fill_diagonal(dist, 1.0)  # placeholder, excluded below to avoid self-energy

    pairwise_potential = -G * np.outer(masses, masses) / dist
    np.fill_diagonal(pairwise_potential, 0.0)
    # Each unordered pair (i, j) appears twice in the full matrix (once as
    # (i, j), once as (j, i)), so halve the sum rather than iterating only
    # the upper triangle -- keeps this vectorized.
    potential = 0.5 * np.sum(pairwise_potential)

    return kinetic + potential


def compute_momentum(velocities, masses):
    """Total linear momentum of the system: sum_i m_i * v_i.

    Returns a (2,) vector. Like energy, this is conserved for an isolated
    system and used as a second, independent check on integration quality.
    """
    return np.sum(masses[:, None] * velocities, axis=0)


def rk4_step(positions, velocities, masses, G, epsilon, dt):
    """Advance the system state by one fixed-size classical RK4 step.

    The system is the first-order ODE d(pos)/dt = vel, d(vel)/dt =
    acc(pos), so RK4 samples the acceleration field at four points across
    the interval (start, two midpoint estimates, end) and combines them
    into a weighted average -- this is what gives RK4 its 4th-order
    accuracy over, e.g., a naive Euler step, while still using a fixed
    timestep (chosen so total step count is predictable and bounded, and
    so bodies can be merged between steps -- see the module using this
    function for why an adaptive-step solver was not used instead).

    Returns (new_positions, new_velocities).
    """
    k1_v = velocities
    k1_a = compute_accelerations(positions, masses, G, epsilon)

    k2_v = velocities + 0.5 * dt * k1_a
    k2_a = compute_accelerations(positions + 0.5 * dt * k1_v, masses, G, epsilon)

    k3_v = velocities + 0.5 * dt * k2_a
    k3_a = compute_accelerations(positions + 0.5 * dt * k2_v, masses, G, epsilon)

    k4_v = velocities + dt * k3_a
    k4_a = compute_accelerations(positions + dt * k3_v, masses, G, epsilon)

    new_positions = positions + (dt / 6.0) * (k1_v + 2 * k2_v + 2 * k3_v + k4_v)
    new_velocities = velocities + (dt / 6.0) * (k1_a + 2 * k2_a + 2 * k3_a + k4_a)

    return new_positions, new_velocities


def merge_collisions(positions, velocities, masses, ids, merge_distance):
    """Merge any bodies closer together than merge_distance into a single
    body, treating each merge as a perfectly inelastic collision (mass
    sums, velocity is the momentum-weighted average) so total mass and
    total momentum of the system are preserved exactly.

    ids is a plain list identifying each row of positions/velocities/masses
    -- used by callers (and the frontend) to track a body across frames
    even as merges change how many bodies exist. A merged body keeps the
    smaller of its two parents' ids, since the smaller id is always the
    older/original body in this simulation's numbering scheme.

    Merges are resolved one pair at a time (closest pair first) because a
    single merge changes the distances between all remaining bodies, so
    later pairs must be re-evaluated against the post-merge state rather
    than a stale distance matrix. With at most 10 bodies per simulation
    this is cheap regardless.

    Returns (positions, velocities, masses, ids) -- unchanged if no pair
    is within merge_distance, otherwise with fewer rows/entries.
    """
    positions = positions.copy()
    velocities = velocities.copy()
    masses = masses.copy()
    ids = list(ids)

    while True:
        n = len(masses)
        if n < 2:
            break

        diff = positions[np.newaxis, :, :] - positions[:, np.newaxis, :]
        dist = np.sqrt(np.sum(diff**2, axis=-1))
        np.fill_diagonal(dist, np.inf)

        i, j = np.unravel_index(np.argmin(dist), dist.shape)
        if dist[i, j] >= merge_distance:
            break

        merged_mass = masses[i] + masses[j]
        merged_position = (masses[i] * positions[i] + masses[j] * positions[j]) / merged_mass
        merged_velocity = (masses[i] * velocities[i] + masses[j] * velocities[j]) / merged_mass
        merged_id = min(ids[i], ids[j])

        keep_mask = np.ones(n, dtype=bool)
        keep_mask[[i, j]] = False

        positions = np.vstack([positions[keep_mask], merged_position])
        velocities = np.vstack([velocities[keep_mask], merged_velocity])
        masses = np.append(masses[keep_mask], merged_mass)
        ids = [id_ for k, id_ in enumerate(ids) if keep_mask[k]] + [merged_id]

    return positions, velocities, masses, ids


def _snapshot_frame(t, positions, velocities, masses, ids, G, epsilon):
    return {
        't': t,
        'positions': positions.copy(),
        'velocities': velocities.copy(),
        'masses': masses.copy(),
        'ids': list(ids),
        'energy': compute_energy(positions, velocities, masses, G, epsilon),
        'momentum': compute_momentum(velocities, masses),
    }


def run_simulation(positions, velocities, masses, ids, G, epsilon, duration, timestep, merge_distance):
    """Run the full fixed-step RK4 integration from t=0 to t=duration,
    checking for and applying collision merges after every step.

    This is the single entry point the Flask service layer calls -- it
    takes plain NumPy arrays/lists in and returns plain Python data out,
    with no knowledge of HTTP, Mongo, or request validation. Enforcing
    limits like the maximum total step count is the caller's job (see
    app/utils/validators.py); this function will simply run whatever
    duration/timestep it's given.

    Returns a list of per-step frames (dicts with t, positions,
    velocities, masses, ids, energy, momentum) at full resolution -- one
    per raw integration step plus the initial state. Downsampling for
    storage/transport is the caller's responsibility, so this stays a
    fully-observable simulation run that's easy to assert against in
    tests.
    """
    steps = int(round(duration / timestep))
    frames = [_snapshot_frame(0.0, positions, velocities, masses, ids, G, epsilon)]

    t = 0.0
    for _ in range(steps):
        positions, velocities = rk4_step(positions, velocities, masses, G, epsilon, timestep)
        positions, velocities, masses, ids = merge_collisions(
            positions, velocities, masses, ids, merge_distance
        )
        t += timestep
        frames.append(_snapshot_frame(t, positions, velocities, masses, ids, G, epsilon))

    return frames
