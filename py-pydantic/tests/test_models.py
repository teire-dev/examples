import pytest

from app.models import load_settings, parse_ticket, to_payload


def test_parse_and_strip():
    ticket = parse_ticket({"id": "7", "subject": "  Double charge  ", "tags": ["billing"]})
    assert ticket.id == 7
    assert ticket.subject == "Double charge"


def test_payload_drops_defaults():
    assert to_payload(parse_ticket({"id": 1, "subject": "Hi"})) == {"id": 1, "subject": "Hi"}


def test_rejects_bad_priority():
    with pytest.raises(ValueError):
        parse_ticket({"id": 1, "subject": "Hi", "priority": 9})


def test_settings_from_environment(monkeypatch):
    monkeypatch.setenv("DESK_TIMEOUT", "2.5")
    assert load_settings().timeout == 2.5
    assert load_settings().api_url == "http://localhost:8000"
