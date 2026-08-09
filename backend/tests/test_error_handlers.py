def test_unknown_route_returns_consistent_json_error_shape(client):
    response = client.get('/api/this-route-does-not-exist')

    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data
    assert 'message' in data['error']
