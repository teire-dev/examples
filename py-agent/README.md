# py-agent

A ticket-triage agent on Nebius Token Factory, through the OpenAI Python SDK, still calling `nvidia/Llama-3_1-Nemotron-Ultra-253B-v1`. Token Factory retired that model on 2026-08-31 and names `nvidia/nemotron-3-super-120b-a12b` as its replacement; requests now fail with `model_not_found`.

The tests run against a local stand-in that answers like the live API: 404 for retired models, and a reasoning model that needs room in `max_tokens` before it answers.

Teire demo repository: Teire should find the retired model, swap it for the replacement, adapt what the new model needs, prove it with the repo's own tests before and after in a sandbox, and open a verified pull request.

```bash
uv sync
uv run python -m pytest -q
```
