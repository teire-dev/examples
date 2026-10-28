# Teire examples

Small, real projects, each built to reproduce one breakage Teire exists to fix: a package major that removes an API the code calls, a retired AI model, a security advisory, or nothing at all (the false-positive checks). Each folder is its own project with its own lockfile and tests. Teire scans this repository as a monorepo, the way it scans yours.

[Teire](https://github.com/teire-dev/teire) is a GitHub App: when a package, API or model changes, it finds the lines that break, fixes them with NVIDIA Nemotron on Nebius Token Factory, runs the project's own checks before and after in a sandbox, and opens a pull request with the proof. [Docs](https://teire.vercel.app/docs).

## The examples

| Folder | Ecosystem | What changed upstream | What Teire should do |
|---|---|---|---|
| [`npm-major`](npm-major) | npm | `openai` 4 → later majors: `httpAgent` removed, `beta.chat.completions.parse` moved, a deep import gone, `runs.retrieve` re-signed | Find the four sites, upgrade, fix, verify, open a ready PR |
| [`npm-zod`](npm-zod) | npm | zod 4 removed `ZodError.errors` and changed `z.record` | Fix the sites, upgrade, verify |
| [`clean`](clean) | npm | `openai` 4 → 7, but nothing this code calls changed | "Not affected" with coverage; a plain verified upgrade |
| [`ai-web`](ai-web) | npm | OpenAI shut down `gpt-4.1-nano` on 2026-10-23 (replacement `gpt-5.6-luna`) | Swap the model ID, verify, open a PR |
| [`go-openai`](go-openai) | Go | OpenAI shut down `gpt-4.1-nano` on 2026-10-23; called through `openai-go/v3` | Swap the model ID, verify, open a PR |
| [`java-openai`](java-openai) | Maven | The same retirement, through `com.openai:openai-java` | Swap the model ID, verify, open a PR |
| [`ruby-openai`](ruby-openai) | RubyGems | The same retirement, through the `openai` gem | Swap the model ID, verify, open a PR |
| [`rust-openai`](rust-openai) | Cargo | The same retirement, through `async-openai` | Swap the model ID, verify, open a PR |
| [`wrapped-models`](wrapped-models) | npm | Groq shut down two Llama models on 2026-08-16; the IDs live in a tier registry, not in the call | Trace the registry to the call with Nemotron, swap both, verify |
| [`py-major`](py-major) | PyPI (uv) | Anthropic SDK 0.125 → 1.x removed `HUMAN_PROMPT`/`AI_PROMPT` and `temperature` on that call | Fix the three sites, upgrade, verify |
| [`py-openai`](py-openai) | PyPI (uv) | OpenAI SDK 0.28 → 1.x removed module-level `ChatCompletion` | Migrate to the client, upgrade, verify |
| [`py-pydantic`](py-pydantic) | PyPI (uv) | pydantic 2 moved `BaseSettings` out and deprecated `@validator`, `parse_obj`, `.dict()` | Migrate, upgrade, verify |
| [`py-httpx`](py-httpx) | PyPI (uv) | httpx 0.28 removed `proxies=` and `app=` | Move to `proxy=` and `WSGITransport`, verify |
| [`py-clean`](py-clean) | PyPI (uv) | httpx 0.28, but only kept APIs are used (a look-alike method included) | "Not affected"; ignore the look-alike; plain verified upgrade |
| [`py-live`](py-live) | PyPI (uv) | Same as `py-major`, plus a test that calls the live API | A **draft** PR labelled `needs-live-access`, never "verified" |
| [`py-agent`](py-agent) | PyPI (uv) | Nebius Token Factory retired `nvidia/Llama-3_1-Nemotron-Ultra-253B-v1` | Swap to the named replacement and give the reasoning model room, verify |
| [`go-major`](go-major) | Go | `github.com/golang-jwt/jwt` v4 → v5: a new module path and removed APIs | Rewrite imports, `go get`, fix the code, verify |
| [`go-clean`](go-clean) | Go | jwt v5, but only kept APIs are used | "Not affected"; move the import path; verify without an agent |
| [`rust-major`](rust-major) | Cargo | `rand` 0.8 → 0.10 renamed and moved APIs | Fix the sites, upgrade, verify |
| [`rust-clean`](rust-clean) | Cargo | `thiserror` 2.0, but this derive compiles unchanged | "Not affected"; plain verified upgrade |
| [`ruby-major`](ruby-major) | RubyGems | Faraday 1.10 → 2.x removed `basic_auth` and middleware classes | Fix the sites, upgrade, verify |
| [`ruby-clean`](ruby-clean) | RubyGems | Faraday 2, but only kept APIs are used | "Not affected"; plain verified upgrade |
| [`rails-db`](rails-db) | RubyGems | Faraday 1 → 2 in a Rails 8.1 app whose tests need PostgreSQL | Start Postgres as CI does, `db:prepare`, fix, verify |
| [`jvm-major`](jvm-major) | Maven | Guava 19 → 33 removed and changed APIs | Fix the sites, upgrade, verify |
| [`jvm-clean`](jvm-clean) | Maven | Guava 33, but only kept APIs are used | "Not affected"; plain verified upgrade |
| [`kotlin-major`](kotlin-major) | Gradle (Kotlin DSL, catalog, locks) | OkHttp 3 → 5: the old functions are errors for Kotlin callers | Fix the Kotlin sites, update the catalog and lock, verify |

Each folder's own README says exactly what breaks and why.

## How this repository is laid out

- Every folder has its own manifest, lockfile and tests; Teire treats each as a project.
- CI lives at the root: one workflow per folder in `.github/workflows/<folder>.yml`, running in that folder (`defaults.run.working-directory`) and only when it changes. Teire reads each project's checks from its own workflow.
- A package used by several folders gets one Teire pull request covering all of them.

These examples used to be separate `teire-dev/demo-*` repositories; they live here now so the organisation stays tidy. Real, unmodified open-source projects Teire is tested on are forks in a separate testing organisation.

## Licence

MIT. See [LICENSE](LICENSE).
