"""Support-desk helpers built on the Anthropic SDK."""

from anthropic import AI_PROMPT, HUMAN_PROMPT, Anthropic

MODEL = "claude-sonnet-4-5"


def make_client(api_key: str, base_url: str | None = None) -> Anthropic:
    return Anthropic(api_key=api_key, base_url=base_url, max_retries=0)


def tag_ticket(client: Anthropic, ticket: str) -> str:
    """One-word category for a ticket, using the text-completions API."""
    result = client.completions.create(
        model="claude-2.1",
        max_tokens_to_sample=5,
        prompt=f"{HUMAN_PROMPT} Tag: {ticket}{AI_PROMPT}",
    )
    return result.completion.strip()


def summarise(client: Anthropic, ticket: str) -> str:
    """A one-sentence summary for the support queue."""
    message = client.messages.create(
        model=MODEL,
        max_tokens=256,
        temperature=0.2,
        messages=[{"role": "user", "content": f"Summarise: {ticket}"}],
    )
    return message.content[0].text
