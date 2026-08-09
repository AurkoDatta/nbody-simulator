from tests.conftest import make_auth_headers

TWO_BODY_PAYLOAD = {
    'name': 'Test Orbit',
    'bodies': [
        {'mass': 1.0, 'position': {'x': -0.5, 'y': 0.0}, 'velocity': {'vx': 0.0, 'vy': -0.5}, 'color': '#4C6EF5', 'label': 'A'},
        {'mass': 1.0, 'position': {'x': 0.5, 'y': 0.0}, 'velocity': {'vx': 0.0, 'vy': 0.5}, 'color': '#FF8A3D', 'label': 'B'},
    ],
    'gConstant': 1.0,
    'softening': 0.01,
    'mergeDistance': 0.05,
    'duration': 1.0,
    'timestep': 0.05,
}


def _create(client, auth_headers, overrides=None):
    payload = {**TWO_BODY_PAYLOAD, **(overrides or {})}
    return client.post('/api/simulations', json=payload, headers=auth_headers)


def test_create_simulation_requires_authentication(client):
    response = client.post('/api/simulations', json=TWO_BODY_PAYLOAD)

    assert response.status_code == 401


def test_create_simulation_returns_config_and_downsampled_frames(client, auth_headers):
    response = _create(client, auth_headers)

    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Orbit'
    assert 'id' in data
    assert len(data['bodies']) == 2
    assert data['frameCount'] == len(data['frames'])
    assert data['frameCount'] <= 2000
    assert 'summary' in data
    assert 'maxRelativeEnergyDrift' in data['summary']


def test_create_simulation_rejects_too_few_bodies(client, auth_headers):
    response = _create(client, auth_headers, {'bodies': TWO_BODY_PAYLOAD['bodies'][:1]})

    assert response.status_code == 422
    assert response.get_json()['error']['code'] == 'invalid_body_count'


def test_create_simulation_rejects_non_positive_mass(client, auth_headers):
    bad_bodies = [dict(b) for b in TWO_BODY_PAYLOAD['bodies']]
    bad_bodies[0] = {**bad_bodies[0], 'mass': 0}
    response = _create(client, auth_headers, {'bodies': bad_bodies})

    assert response.status_code == 422
    assert response.get_json()['error']['code'] == 'invalid_mass'


def test_create_simulation_rejects_excessive_step_count(client, auth_headers):
    response = _create(client, auth_headers, {'duration': 1000.0, 'timestep': 0.0001})

    assert response.status_code == 422
    assert response.get_json()['error']['code'] == 'step_count_exceeded'


def test_list_simulations_returns_metadata_without_frames(client, auth_headers):
    _create(client, auth_headers)

    response = client.get('/api/simulations', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['name'] == 'Test Orbit'
    assert 'frames' not in data[0]


def test_get_simulation_returns_full_config_and_frames(client, auth_headers):
    created = _create(client, auth_headers).get_json()

    response = client.get(f"/api/simulations/{created['id']}", headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == created['id']
    assert len(data['bodies']) == 2
    assert len(data['frames']) == created['frameCount']


def test_get_unknown_simulation_returns_404(client, auth_headers):
    response = client.get('/api/simulations/000000000000000000000000', headers=auth_headers)

    assert response.status_code == 404


def test_update_simulation_renames_it(client, auth_headers):
    created = _create(client, auth_headers).get_json()

    response = client.put(f"/api/simulations/{created['id']}", json={'name': 'Renamed Orbit'}, headers=auth_headers)

    assert response.status_code == 200
    assert response.get_json()['name'] == 'Renamed Orbit'
    listed = client.get('/api/simulations', headers=auth_headers).get_json()
    assert listed[0]['name'] == 'Renamed Orbit'


def test_delete_simulation_removes_it(client, auth_headers):
    created = _create(client, auth_headers).get_json()

    response = client.delete(f"/api/simulations/{created['id']}", headers=auth_headers)

    assert response.status_code == 204
    assert client.get(f"/api/simulations/{created['id']}", headers=auth_headers).status_code == 404


def test_user_cannot_see_another_users_simulation(client, auth_headers):
    created = _create(client, auth_headers).get_json()
    other_headers = make_auth_headers(client, email='second-pilot@example.com')

    list_response = client.get('/api/simulations', headers=other_headers)
    get_response = client.get(f"/api/simulations/{created['id']}", headers=other_headers)

    assert list_response.get_json() == []
    assert get_response.status_code == 404
