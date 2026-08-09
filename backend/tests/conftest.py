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
