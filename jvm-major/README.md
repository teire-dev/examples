# jvm-major

SKU labels, tag normalisation and asynchronous stock totals for a warehouse, on Guava 19.0 (Maven, Java 17).

Guava is now at 33.x (`-jre`). Between them:
- `Objects.toStringHelper` moved to `MoreObjects` (removed from `Objects` in 21.0);
- the `CharMatcher` constants (`WHITESPACE`, `JAVA_LETTER_OR_DIGIT`, …) became methods (`whitespace()`, …) and the constants were removed;
- `Futures.transform` without an `Executor` was removed (pass `MoreExecutors.directExecutor()` or your own).

The tests cover normalisation, labels, the asynchronous total and the SKU's string form.

Teire demo repository: Teire should find the upgrade, compare the two versions' bytecode, find the affected lines, move the version property, adapt the code, prove it with these tests before and after in a sandbox, and open a verified pull request.

```bash
mvn -B verify
```
