import httpx

from app.feed import latest, make_client, mirror_config


def feed(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/httpx.json":
        return httpx.Response(200, json={"latest": "0.28.1"})
    return httpx.Response(404, json={"error": "unknown package"})


def test_latest_version():
    with make_client(httpx.MockTransport(feed)) as client:
        assert latest(client, "httpx") == "0.28.1"


def test_unknown_package_raises():
    with make_client(httpx.MockTransport(feed)) as client:
        try:
            latest(client, "nope")
        except httpx.HTTPStatusError as error:
            assert error.response.status_code == 404
        else:
            raise AssertionError("expected a 404")


def test_mirror_config_is_our_own_code():
    assert mirror_config("feed") == {"app": "feed", "proxies": {"https": "http://mirror.local:3128"}}
