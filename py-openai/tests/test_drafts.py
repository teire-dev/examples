from app.drafts import classify, configure, draft_reply


def test_draft_reply(api_base):
    configure("test-key", api_base)
    assert draft_reply("I was charged twice") == "Sorry about the double charge; a refund is on its way."


def test_classify(api_base):
    configure("test-key", api_base)
    assert classify("I was charged twice") == "billing"
