from app.poller import check, check_all, local_client, make_client
from app.web import application


def test_in_process_health_check():
    with local_client(application) as client:
        assert check(client, "/health") == {"url": "/health", "status": 200, "healthy": True, "version": "2026.10"}


def test_missing_endpoint_is_unhealthy():
    with local_client(application) as client:
        result = check_all(client, ["/health", "/missing"])
    assert [r["healthy"] for r in result] == [True, False]


def test_proxy_client_builds_without_network():
    client = make_client(proxy_url="http://127.0.0.1:3128", timeout=2.0)
    assert client.timeout.read == 2.0
    client.close()
