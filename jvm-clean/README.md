# jvm-clean

Pick lists for warehouse staff on Guava 19.0 (Maven, Java 17), using only what Guava 33 keeps: `ImmutableList`, `Preconditions`, `Strings`, `Joiner`.

Teire demo repository (false-positive check): Guava 33 is many majors later, but nothing this code calls was removed. Teire should say "not affected" and verify a plain upgrade without an agent.

```bash
mvn -B verify
```
