"""Helpers for translating between registration input and the `users`
collection document, and for serializing a user for API responses (the
password hash must never appear in a response).
"""

from datetime import datetime, timezone


def document_from_registration(name, email, password_hash):
    return {
        'name': name,
        'email': email,
        'passwordHash': password_hash,
        'createdAt': datetime.now(timezone.utc),
    }


def serialize_user(doc):
    return {
        'id': str(doc['_id']),
        'name': doc['name'],
        'email': doc['email'],
        'createdAt': doc['createdAt'].isoformat(),
    }
