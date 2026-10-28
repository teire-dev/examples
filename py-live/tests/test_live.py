import os

from anthropic import Anthropic


def test_models_endpoint_answers():
    """Talks to the real Anthropic API: it needs the network and an API key."""
    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "not-set"), max_retries=0)
    page = client.models.list()
    assert page.data is not None
