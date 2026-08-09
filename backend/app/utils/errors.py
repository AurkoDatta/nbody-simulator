"""Custom exceptions and global JSON error handlers.

Every error response from this API -- whether raised deliberately via
ApiError or produced by Flask/Werkzeug itself (404, 405, an unhandled
exception) -- comes back in the same {"error": {"code", "message"}}
shape, so the frontend only needs a single error-handling code path.
"""

from flask import jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Raised by route/service code for an expected, user-facing error
    (bad input, not found, unauthorized, ...) with a specific HTTP status
    code and a machine-readable code string."""

    def __init__(self, message, status_code=400, code='bad_request'):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


def register_error_handlers(app):
    """Attach handlers so ApiError, standard HTTP errors (404, 405, ...),
    and any unexpected exception all serialize to the same JSON shape.
    """

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify({'error': {'code': error.code, 'message': error.message}}), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        code = (error.name or 'error').lower().replace(' ', '_')
        return jsonify({'error': {'code': code, 'message': error.description}}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception('Unhandled exception')
        return jsonify({'error': {'code': 'internal_error', 'message': 'An unexpected error occurred.'}}), 500
