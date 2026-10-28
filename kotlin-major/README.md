# kotlin-major

Relays JSON events to partners' webhooks, in Kotlin on OkHttp 3.14.9 (Gradle Kotlin DSL, version catalog, dependency locking).

OkHttp is now at 5.x. Its Java API mostly still links, but for Kotlin callers the old functions are errors:
- `HttpUrl.parse(s)` → `s.toHttpUrlOrNull()`, `MediaType.parse(s)` → `s.toMediaTypeOrNull()` (moved to extension functions);
- `response.code()`, `request.url()`, `request.body()` → `response.code`, `request.url`, `request.body` (moved to vals);
- `ResponseBody.create(type, s)` → `s.toResponseBody(type)`;
- OkHttp 5 publishes its classes as `okhttp-jvm`.

The tests answer calls with an interceptor, so they run offline: the resolved URL, method and content type, 2xx vs 500, and a bad base URL.

Teire demo repository: Teire should find the upgrade, read the Kotlin deprecation levels from the new jar, find the affected lines, move the catalog version and update only OkHttp's entries in `gradle.lockfile`, adapt the code, prove it with these tests before and after in a sandbox, and open a verified pull request.

```bash
./gradlew build
```
