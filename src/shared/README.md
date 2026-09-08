# shared

Everything with no business knowledge at all: the UI kit, class helpers, formatters,
constants, the API client. Reusable in any project that has nothing to do with plants.

**May import:** shared only.
**May be imported by:** every layer.

The test for this layer: if a file mentions a plant, a price or a cart, it does not
belong here.

- `ui/` — presentational primitives (Button, Input, Modal, ...). No data fetching.
- `lib/` — pure helpers. No React unless it is a generic hook.
- `config/` — constants and environment access.
