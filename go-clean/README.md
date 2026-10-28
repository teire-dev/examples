# go-clean

Session tokens for a support desk on `github.com/golang-jwt/jwt/v4`, using only what v5 keeps: `NewWithClaims`, `MapClaims`, `SignedString`, `Parse` and `Valid`.

Teire demo repository (false-positive check): v5 is a new major (a new module path), but nothing this code calls changed. Teire should say "not affected", move the import path, and verify the upgrade without an agent.
