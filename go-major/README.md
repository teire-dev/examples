# go-major

The session tokens of a support desk API, signed and verified with `github.com/golang-jwt/jwt/v4` (4.5.2).

The library's current major is v5 (`github.com/golang-jwt/jwt/v5`, 5.3.1), a new module path with breaking changes this code depends on:
- `jwt.StandardClaims` is gone (v5 has `RegisteredClaims`, with `*NumericDate` times);
- `*jwt.ValidationError` and its `ValidationErrorExpired` bit are gone (v5 returns errors to match with `errors.Is`, such as `jwt.ErrTokenExpired`).

It also reads the user's preferred language with `golang.org/x/text` v0.3.5, whose `language.ParseAcceptLanguage` has published advisories (fixed in v0.3.7 and v0.3.8); other advisories for that module concern packages this code never imports.

The tests run offline: issue and verify, an expired token, a wrong secret, the preferred language.

Teire demo repository: Teire should find the upgrade, compare the two majors' APIs, locate the affected lines by type, move the imports to `/v5`, adapt the code, prove it with these tests before and after in a sandbox, and open a verified pull request. For the advisories it should say which are called from this code and which are not.

```bash
go vet ./...
go test ./...
```
