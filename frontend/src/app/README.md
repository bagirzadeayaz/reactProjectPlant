# app

The composition root. Providers, the router, global styles, error boundaries — the wiring
that turns a pile of layers into a running application.

**May import:** pages, widgets, features, entities, shared.
**May be imported by:** nothing. Only `src/main.tsx` reaches in here.

Put here: the Redux store setup, `<Providers>`, route definitions, the app shell.
Do not put here: anything with business meaning. If it knows what a plant is, it belongs
in `entities` or below.
