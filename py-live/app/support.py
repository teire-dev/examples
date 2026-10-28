"""Support-desk helpers built on the Anthropic SDK."""

from anthropic import Anthropic

MODEL = "claude-sonnet-4-5"


def make_client(api_key: str, base_url: str | None = None) -> Anthropic:
    return Anthropic(api_key=api_key, base_url=base_url, max_retries=0)


def tag_ticket(client: Anthropic, ticket: str) -> str:
    """One-word category for a ticket, using the Messages API."""
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=5,
        messages=[
            {"role": "user", "content": f"Tag: {ticket}"}
        ],
    )
    return message.content[0].text.strip()


def summarise(client: Anthropic, ticket: str) -> str:
    """A one-sentence summary for the support queue."""
    message = client.messages.create(
        model=MODEL,
        max_tokens=256,
        messages=[{"role": "user", "content": f"Summarise: {ticket}"}],
    )
    return message.content[0].text
