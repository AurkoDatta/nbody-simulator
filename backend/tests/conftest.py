import pytest

from app import create_app


@pytest.fixture
def app():
    """Flask app configured for testing -- uses an in-memory mongomock
    database instead of a real MongoDB instance so the test suite has no
    external dependency."""
    return create_app(testing=True)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register a fresh user and return an Authorization header carrying
    their JWT, for tests that exercise routes behind @jwt_required()."""
    response = client.post(
        '/api/auth/register',
        json={'name': 'Pilot', 'email': 'pilot@example.com', 'password': 'orbit-secret'},
    )
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}


def make_auth_headers(client, email):
    """Like auth_headers, but for tests that need a second, distinct
    user (e.g. to verify one user can't see another's simulations)."""
    response = client.post(
        '/api/auth/register',
        json={'name': 'Second Pilot', 'email': email, 'password': 'orbit-secret'},
    )
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}
