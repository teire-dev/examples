# py-pydantic

Ticket models and settings on pydantic 1.10.18: `BaseSettings`, `@validator`, `parse_obj` and `.dict()`. pydantic 2 moved `BaseSettings` out of the package and deprecated the rest, so the upgrade breaks this code at import.

Teire demo repository: Teire should find the affected sites, upgrade pydantic, migrate the code, prove it with the repo's own tests before and after in a sandbox, and open a pull request with what it verified.

```bash
uv sync
uv run python -m pytest -q
```
