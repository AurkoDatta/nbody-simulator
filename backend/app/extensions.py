"""Shared extension instances, initialized against the app in create_app().

Kept as module-level singletons (the standard Flask-extensions pattern)
so route/service modules can `from app.extensions import get_db` without
passing the app instance around everywhere.
"""

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

cors = CORS()
jwt = JWTManager()

_mongo_client = None
_db = None


def init_mongo(app):
    """Point the module-level db handle at either a real MongoDB instance
    or an in-memory mongomock database, depending on app.config['TESTING'].
    Mongomock keeps the test suite free of any external service dependency.
    """
    global _mongo_client, _db

    if app.config.get('TESTING'):
        import mongomock

        _mongo_client = mongomock.MongoClient()
    else:
        _mongo_client = MongoClient(app.config['MONGO_URI'])

    _db = _mongo_client[app.config['MONGO_DB_NAME']]


def get_db():
    """Return the active database handle. Only valid after init_mongo()
    has run as part of create_app()."""
    return _db
