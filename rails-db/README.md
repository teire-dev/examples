# rails-db

A Rails 8.1 app on PostgreSQL that mirrors vendors' status-page incidents into its own `incidents` table, on `faraday` 1.10.

Its tests need the database: model validations and scopes, and a sync service whose HTTP layer is stubbed with Faraday's test adapter (so they run offline). CI starts Postgres as a service, runs `bin/rails db:prepare`, then `bin/rails test`.

`faraday` is now at 2.x, where `Connection#basic_auth` is gone (auth is configured in the builder).

Teire demo repository: Teire should find the upgrade, re-lock only Faraday, adapt the service, then prove it by running this app's test suite, with PostgreSQL started inside the sandbox and the schema loaded, before and after the change.

```bash
bin/rails db:prepare
bin/rails test
```
