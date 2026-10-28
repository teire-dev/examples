# ruby-major

A small client for a Statuspage-style API (component health, open incidents) on `faraday` 1.10 (1.10.6).

`faraday` is now at 2.14 (2.14.4). Between them:
- `Connection#basic_auth`, `#token_auth` and `#authorization` were removed (auth is configured in the builder with the `:authorization` request middleware);
- `Faraday::Response::Middleware` was removed (`Faraday::Middleware` with `on_complete`);
- the adapters other than `net_http` moved out to their own gems.

The tests stub the HTTP layer with Faraday's test adapter, so they run offline: component and incident parsing, the Basic and Bearer `Authorization` headers, and 5xx responses raising `StatusClient::Error`.

Teire demo repository: Teire should find the upgrade, compare the two versions' APIs from both published gems, find the affected lines, move the Gemfile requirement and re-lock only Faraday, adapt the code, prove it with these tests before and after in a sandbox, and open a verified pull request.

```bash
bundle exec rake test
```
