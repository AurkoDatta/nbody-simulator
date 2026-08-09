"""Environment-driven configuration for the Flask application factory."""

import os


class Config:
    """Reads all secrets/connection info from environment variables so
    nothing sensitive (Mongo URI, JWT secret) is ever hardcoded or
    committed -- see .env.example for the variables this expects.
    """

    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nbody_simulator')
    MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'nbody_simulator')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-me')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
