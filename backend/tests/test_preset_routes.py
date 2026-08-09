def test_list_presets_returns_all_built_in_presets(client):
    response = client.get('/api/presets')

    assert response.status_code == 200
    data = response.get_json()
    names = {preset['name'] for preset in data}
    assert names == {'figure_eight', 'solar_system', 'random_cluster'}
    for preset in data:
        assert len(preset['bodies']) >= 2
