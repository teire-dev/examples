from app.support import make_client, summarise, tag_ticket


def test_tag_ticket(api_base):
    client = make_client("test-key", api_base)
    assert tag_ticket(client, "I was charged twice") == "billing"


def test_summarise(api_base):
    client = make_client("test-key", api_base)
    assert summarise(client, "I was charged twice") == "Customer was charged twice."
