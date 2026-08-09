import numpy as np
import pytest

from app.physics.nbody import (
    compute_accelerations,
    compute_energy,
    compute_momentum,
    merge_collisions,
    rk4_step,
    run_simulation,
)


def test_two_body_acceleration_obeys_newtons_third_law():
    """Force on body 0 from body 1 must be equal and opposite to the
    force on body 1 from body 0 (F = m*a), regardless of mass ratio."""
    positions = np.array([[0.0, 0.0], [3.0, 0.0]])
    masses = np.array([2.0, 5.0])
    G = 1.0
    epsilon = 0.0

    accelerations = compute_accelerations(positions, masses, G, epsilon)

    force_on_0 = masses[0] * accelerations[0]
    force_on_1 = masses[1] * accelerations[1]
    np.testing.assert_allclose(force_on_0, -force_on_1)


def test_compute_energy_matches_hand_calculation_for_two_stationary_bodies():
    """With zero velocity, total energy is purely gravitational potential
    energy: U = -G*m1*m2/r. Kinetic energy must contribute nothing."""
    positions = np.array([[0.0, 0.0], [2.0, 0.0]])
    velocities = np.array([[0.0, 0.0], [0.0, 0.0]])
    masses = np.array([3.0, 4.0])
    G = 1.0
    epsilon = 0.0

    energy = compute_energy(positions, velocities, masses, G, epsilon)

    expected_potential = -G * masses[0] * masses[1] / 2.0
    assert energy == expected_potential


def test_compute_momentum_is_mass_weighted_sum_of_velocities():
    velocities = np.array([[1.0, 0.0], [0.0, 2.0]])
    masses = np.array([2.0, 5.0])

    momentum = compute_momentum(velocities, masses)

    np.testing.assert_allclose(momentum, [2.0 * 1.0 + 5.0 * 0.0, 2.0 * 0.0 + 5.0 * 2.0])


def _circular_two_body_orbit(G=1.0, m=1.0, r=1.0):
    """Set up two equal masses on a circular orbit about their shared
    center of mass, separated by distance r."""
    masses = np.array([m, m])
    omega = np.sqrt(G * 2 * m / r**3)
    speed = omega * (r / 2)
    positions = np.array([[-r / 2, 0.0], [r / 2, 0.0]])
    velocities = np.array([[0.0, -speed], [0.0, speed]])
    return positions, velocities, masses


def test_rk4_step_conserves_energy_for_circular_two_body_orbit():
    """A circular orbit should keep total energy essentially constant --
    this is the correctness signal the diagnostics page visualizes."""
    G, epsilon = 1.0, 0.0
    positions, velocities, masses = _circular_two_body_orbit(G=G)
    initial_energy = compute_energy(positions, velocities, masses, G, epsilon)

    dt = 0.001
    for _ in range(2000):
        positions, velocities = rk4_step(positions, velocities, masses, G, epsilon, dt)

    final_energy = compute_energy(positions, velocities, masses, G, epsilon)
    relative_drift = abs((final_energy - initial_energy) / initial_energy)
    assert relative_drift < 1e-6


def test_rk4_step_preserves_mirror_symmetry():
    """Two equal masses in a mirror-symmetric configuration about the
    y-axis must stay mirror-symmetric after integration -- any asymmetry
    would indicate a bug in the vectorized force calculation."""
    G, epsilon = 1.0, 0.0
    masses = np.array([1.0, 1.0])
    positions = np.array([[-1.0, 0.6], [1.0, 0.6]])
    velocities = np.array([[-0.2, -0.5], [0.2, -0.5]])

    dt = 0.01
    for _ in range(50):
        positions, velocities = rk4_step(positions, velocities, masses, G, epsilon, dt)

    np.testing.assert_allclose(positions[0], [-positions[1][0], positions[1][1]], atol=1e-10)
    np.testing.assert_allclose(velocities[0], [-velocities[1][0], velocities[1][1]], atol=1e-10)


def test_softening_bounds_acceleration_at_near_zero_separation():
    """Without softening, two bodies passing arbitrarily close together
    produce an unbounded acceleration (division by ~0). With a nonzero
    epsilon, the acceleration stays finite and smaller in magnitude."""
    G = 1.0
    masses = np.array([1.0, 1.0])
    positions = np.array([[0.0, 0.0], [1e-6, 0.0]])
    epsilon = 0.1

    acc_softened = compute_accelerations(positions, masses, G, epsilon)
    acc_unsoftened = compute_accelerations(positions, masses, G, 0.0)

    assert np.all(np.isfinite(acc_softened))
    assert np.linalg.norm(acc_softened[0]) < np.linalg.norm(acc_unsoftened[0])


def test_merge_collisions_conserves_mass_and_momentum():
    """Two close bodies merge into one (perfectly inelastic collision); a
    distant third body is untouched. Total mass and momentum of the whole
    system must be identical before and after."""
    positions = np.array([[0.0, 0.0], [0.05, 0.0], [10.0, 10.0]])
    velocities = np.array([[1.0, 0.0], [-1.0, 0.0], [0.0, 0.0]])
    masses = np.array([2.0, 3.0, 5.0])
    ids = [0, 1, 2]
    merge_distance = 0.1

    new_positions, new_velocities, new_masses, new_ids = merge_collisions(
        positions, velocities, masses, ids, merge_distance
    )

    assert len(new_masses) == 2
    assert new_masses.sum() == masses.sum()
    np.testing.assert_allclose(
        compute_momentum(new_velocities, new_masses),
        compute_momentum(velocities, masses),
    )
    assert 2 in new_ids


def test_merge_collisions_is_no_op_when_bodies_are_far_apart():
    positions = np.array([[0.0, 0.0], [5.0, 0.0]])
    velocities = np.array([[0.0, 0.0], [0.0, 0.0]])
    masses = np.array([1.0, 1.0])
    ids = [0, 1]

    new_positions, new_velocities, new_masses, new_ids = merge_collisions(
        positions, velocities, masses, ids, merge_distance=0.1
    )

    assert len(new_masses) == 2
    assert new_ids == ids


def test_run_simulation_produces_one_frame_per_step_plus_initial():
    positions, velocities, masses = _circular_two_body_orbit()
    ids = [0, 1]

    frames = run_simulation(
        positions, velocities, masses, ids,
        G=1.0, epsilon=0.0, duration=1.0, timestep=0.1, merge_distance=0.01,
    )

    assert len(frames) == 11  # t=0.0 through t=1.0 inclusive, step 0.1
    assert frames[0]['t'] == 0.0
    np.testing.assert_allclose(frames[0]['positions'], positions)
    assert frames[-1]['t'] == pytest.approx(1.0)


def test_run_simulation_reduces_body_count_after_collision():
    """Two bodies on a direct collision course should merge into one
    partway through the run, and every frame after the merge should
    reflect the reduced body count."""
    positions = np.array([[-0.5, 0.0], [0.5, 0.0]])
    velocities = np.array([[5.0, 0.0], [-5.0, 0.0]])
    masses = np.array([1.0, 1.0])
    ids = [0, 1]

    frames = run_simulation(
        positions, velocities, masses, ids,
        G=0.0, epsilon=0.0, duration=0.2, timestep=0.01, merge_distance=0.2,
    )

    assert len(frames[0]['ids']) == 2
    assert len(frames[-1]['ids']) == 1
    assert frames[-1]['masses'].sum() == pytest.approx(2.0)
