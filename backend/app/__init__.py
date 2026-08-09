"""Application factory for the N-Body Simulator backend."""

from dotenv import load_dotenv
from flask import Flask

from app.config import Config
from app.extensions import cors, init_mongo, jwt
from app.routes.preset_routes import preset_bp
from app.utils.errors import register_error_handlers

load_dotenv()


def create_app(testing=False):
    """Build and configure the Flask app.

    Kept as a factory (rather than a module-level app instance) so tests
    can create isolated app instances -- each with their own mongomock
    database -- without that isolation leaking between test runs.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['TESTING'] = testing

    cors.init_app(app, resources={r'/api/*': {'origins': '*'}})
    jwt.init_app(app)
    init_mongo(app)

    register_error_handlers(app)

    app.register_blueprint(preset_bp, url_prefix='/api')

    return app
