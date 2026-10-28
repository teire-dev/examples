"""Ticket triage on Nebius Token Factory, through its OpenAI-compatible API."""

import os

from openai import OpenAI

TOKEN_FACTORY_URL = "https://api.tokenfactory.nebius.com/v1/"
MODEL = "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1"
CATEGORIES = ("billing", "bug", "account", "other")


def make_client(base_url: str | None = None) -> OpenAI:
    return OpenAI(base_url=base_url or TOKEN_FACTORY_URL, api_key=os.environ.get("NEBIUS_API_KEY", "test"), max_retries=0)


def classify(client: OpenAI, ticket: str) -> str:
    """One category for a support ticket."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"Answer with one word from: {', '.join(CATEGORIES)}."},
            {"role": "user", "content": ticket},
        ],
        max_tokens=8,
        temperature=0,
    )
    answer = response.choices[0].message.content.strip().lower()
    return answer if answer in CATEGORIES else "other"
