"""Input validation for simulation creation requests.

These bounds are enforced server-side regardless of what the frontend
already checks, since they exist to keep a single synchronous request's
compute time bounded -- a client can't be trusted to self-limit.
"""

from app.utils.errors import ApiError

MIN_BODIES = 2
MAX_BODIES = 10
MAX_INTEGRATION_STEPS = 200_000


def validate_simulation_request(data):
    """Raise ApiError on the first invalid field found in a simulation
    creation payload. Returns nothing on success."""
    bodies = data.get('bodies')
    if not isinstance(bodies, list) or not (MIN_BODIES <= len(bodies) <= MAX_BODIES):
        raise ApiError(
            f'A simulation must have between {MIN_BODIES} and {MAX_BODIES} bodies.',
            422, 'invalid_body_count',
        )

    for body in bodies:
        mass = body.get('mass')
        if not isinstance(mass, (int, float)) or isinstance(mass, bool) or mass <= 0:
            raise ApiError('Every body must have a positive mass.', 422, 'invalid_mass')

    duration = data.get('duration')
    timestep = data.get('timestep')
    if not isinstance(duration, (int, float)) or isinstance(duration, bool) or duration <= 0:
        raise ApiError('Duration must be a positive number.', 422, 'invalid_duration')
    if not isinstance(timestep, (int, float)) or isinstance(timestep, bool) or timestep <= 0:
        raise ApiError('Timestep must be a positive number.', 422, 'invalid_timestep')

    if duration / timestep > MAX_INTEGRATION_STEPS:
        raise ApiError(
            f'duration/timestep must not exceed {MAX_INTEGRATION_STEPS} integration steps.',
            422, 'step_count_exceeded',
        )
