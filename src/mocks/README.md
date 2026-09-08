# mocks

The app's backend. MSW handlers plus the seed data, running in three places:

| Where | Entry point | Started by |
| --- | --- | --- |
| Browser (dev and static deploy) | `browser.ts` | `src/main.tsx` |
| Tests | `server.ts` | `vitest.setup.ts` |

There is one definition of how the API behaves, so a test cannot pass against a
mock the app never uses.

## Outside the layer graph

This folder is dev and test infrastructure, not application code. It reaches into
`entities` for their types — something no layer below `app` may do — so it is
listed in `boundaries/ignore` in `eslint.config.js` rather than being classified
as a layer. Nothing in `app`, `pages`, `widgets`, `features`, `entities` or
`shared` should import from here; only `src/main.tsx`, `vitest.setup.ts` and test
files.

## Files

- `seed.ts` — content lifted from the Figma comp (frame `22:2`), with the node id
  for every name and price. The comp's body copy is lorem ipsum, so the English
  descriptions are written to fit each plant and the Russian is a translation of
  that English.
- `db.ts` — the in-memory database, written through to `localStorage` under
  `planto:db` so an added product survives a reload. `db.reset()` puts it back to
  the seed; `vitest.setup.ts` calls it after every test.
- `query.ts` — search, category filter, sort and pagination for the list
  endpoint. Search matches both languages, so a Russian query finds a product.
- `handlers.ts` — the endpoints. Bodies are validated with the same zod schemas
  the client uses, and an invalid body comes back as 422 with the issues.
- `slug.ts` — slug generation, including the `-2`, `-3` suffix that stops a
  duplicate name from overwriting an existing product.

## Endpoints

```
GET    /api/products          search, category, sort, page, perPage
GET    /api/products/:slug
POST   /api/products          201, or 422 with zod issues
PATCH  /api/products/:id      404 if unknown
DELETE /api/products/:id      204, or 404
GET    /api/reviews           optional productId
GET    /api/categories
```
