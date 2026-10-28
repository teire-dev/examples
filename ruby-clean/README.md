# ruby-clean

Parcel tracking on `faraday` 1.10, using only what Faraday 2 keeps: `Faraday.new` with a block, headers, `get` and the test adapter.

Teire demo repository (false-positive check): Faraday 2 is a new major, but nothing this code calls was removed. Teire should say "not affected" and verify a plain upgrade without an agent.
