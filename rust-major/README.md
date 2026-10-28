# rust-major

Ticket IDs, agent assignment, follow-up timing and queue order for a support desk, on `rand` 0.8 (0.8.8, with the `small_rng` feature).

`rand` is now at 0.10 (0.10.3). Between them:
- `rand::distributions` became `rand::distr` (`Alphanumeric`, `Uniform`, `Distribution` moved);
- `thread_rng()` and the `Rng` trait at its old path are gone;
- `SliceRandom::choose` moved to another trait;
- the `small_rng` feature was removed (`SmallRng` is always available).

The tests check properties, not exact random values (rand does not promise the same values across versions): ID shape, assignment from the shift, follow-ups inside the window, jitter bounds, shuffles that keep every ticket.

Teire demo repository: Teire should find the upgrade, compare the two versions' APIs from their published rustdoc, find the affected lines and the removed feature, bump the requirement and the lockfile, adapt the code, prove it with these tests before and after in a sandbox, and open a verified pull request.

```bash
cargo test
```
