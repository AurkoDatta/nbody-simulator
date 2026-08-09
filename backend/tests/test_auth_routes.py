def _register(client, email='pilot@example.com', password='orbit-secret', name='Pilot'):
    return client.post('/api/auth/register', json={'name': name, 'email': email, 'password': password})


def test_register_creates_user_and_returns_token(client):
    response = _register(client)

    assert response.status_code == 201
    data = response.get_json()
    assert data['user']['email'] == 'pilot@example.com'
    assert 'passwordHash' not in data['user']
    assert 'token' in data


def test_register_rejects_duplicate_email(client):
    _register(client)

    response = _register(client)

    assert response.status_code == 409
    assert response.get_json()['error']['code'] == 'email_taken'


def test_register_rejects_short_password(client):
    response = _register(client, password='short')

    assert response.status_code == 422
    assert response.get_json()['error']['code'] == 'weak_password'


def test_login_with_correct_credentials_returns_token(client):
    _register(client)

    response = client.post('/api/auth/login', json={'email': 'pilot@example.com', 'password': 'orbit-secret'})

    assert response.status_code == 200
    assert 'token' in response.get_json()


def test_login_with_wrong_password_is_rejected(client):
    _register(client)

    response = client.post('/api/auth/login', json={'email': 'pilot@example.com', 'password': 'wrong-password'})

    assert response.status_code == 401
    assert response.get_json()['error']['code'] == 'invalid_credentials'
