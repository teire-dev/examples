# py-live

The same support-desk helpers as `demo-py-major`, plus one test that calls the real Anthropic API. Teire runs checks with the network off, so that test cannot pass in its sandbox, before or after the upgrade.

Teire demo repository: the upgrade PR should open as a **draft** labelled `needs-live-access`, saying which test needs the network, instead of claiming a verified result.
