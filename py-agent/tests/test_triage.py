from app.triage import classify, make_client


def test_billing_ticket(token_factory):
    assert classify(make_client(token_factory), "I was charged twice for my invoice") == "billing"


def test_unclear_ticket(token_factory):
    assert classify(make_client(token_factory), "Hello there") == "other"
