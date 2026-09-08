# Planto

A plant shop built from a Figma design: landing page, catalog with URL-backed filters,
product pages, a persistent cart, a mock admin with full product CRUD, and English/Russian
throughout. Everything runs in the browser — the "backend" is a Mock Service Worker with a
seeded catalog persisted to `localStorage`, so a static deploy is the whole app.

Design source: Figma file `jgggt59SlkGZe4CEVwebOJ`, frame `22:2`. The token layer in
`src/index.css` cites the node every value came from.

## Stack, and why

| Piece                               | Why this one                                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19 + TypeScript (strict)      | `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on; no `any`, non-null assertions or `@ts-ignore` — all lint errors.                            |
| Vite 8                              | Build and dev server; route-level code splitting out of the box.                                                                                            |
| Tailwind CSS 4                      | CSS-first: the `@theme` block in `src/index.css` _is_ the design system. Components reference tokens only.                                                  |
| Redux Toolkit + RTK Query           | RTK Query owns server state (cache, tags, optimistic updates); one plain slice owns the cart. They never copy from each other.                              |
| React Router 7 (data router)        | Lazy routes, `useBlocker` for the unsaved-changes guard. Language is a query parameter, not a path prefix, so every page has one canonical URL.             |
| react-i18next                       | Typed `t()`, six namespaces, EN/RU parity enforced by a script in `lint`. Content (product names) is localized in the data instead.                         |
| zod                                 | One schema per entity is the single source of validation truth — the mock backend and the admin form check the same one. Kept out of the storefront bundle. |
| React Hook Form                     | The admin form, resolved by the zod schema above.                                                                                                           |
| Mock Service Worker                 | The backend, in dev, in tests and in production. Same handlers everywhere.                                                                                  |
| Vitest + Testing Library + axe-core | Unit, component, integration and accessibility tests in one runner.                                                                                         |
| Playwright                          | The three user journeys, end to end, in Chromium desktop and mobile.                                                                                        |
| Feature-Sliced Design               | `app → pages → widgets → features → entities → shared`, enforced by `eslint-plugin-boundaries` as an error. See `ARCHITECTURE.md`.                          |

## Setup

Node 22 and npm.

```sh
npm ci
npm run dev        # http://localhost:5173
```

The first request waits for the mock service worker to register; after that the catalog
is served from `localStorage` (`planto:db`). Clear site data to reset it to the seed.

## Scripts

| Command                 | What it does                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run dev`           | Dev server with HMR                                                         |
| `npm run build`         | Typecheck, EN/RU key check, production build to `dist/`                     |
| `npm run build:report`  | Build, then print every chunk's gzip size; fails above 200 KB               |
| `npm run preview`       | Serve `dist/` locally                                                       |
| `npm run lint`          | ESLint (type-aware, layer boundaries, a11y) + i18n key and plural parity    |
| `npm run typecheck`     | `tsc -b --noEmit`                                                           |
| `npm test`              | Vitest, jsdom                                                               |
| `npm run test:coverage` | Same with coverage; 80% threshold on lines, branches, functions, statements |
| `npm run e2e`           | Playwright against the production build (builds first)                      |
| `npm run e2e:ui`        | Playwright's UI mode                                                        |
| `npm run images`        | Regenerate AVIF/WebP variants from the PNG/JPG sources in `public/`         |
| `npm run check:i18n`    | The parity check on its own                                                 |

## Environment variables

None. There is no backend, no API key and no analytics. The only runtime switches are in
the browser: `?lang=ru` (or `localStorage` `planto:lang`) for the language and
`localStorage` `planto:admin` for the admin area.

## Admin is a mock

`/admin/products` adds, edits and deletes products, but **there is no login and no
server**. The "Enter demo admin" button sets a flag in `localStorage` (`planto:admin`);
that is the whole access control, and it is deliberate. Every change made in the admin is
local to the browser it was made in. Uploaded images are stored there too, as base64 data
URLs, which is why the upload limit is 300 KB.

## Deploy

The build is static. `vercel.json` and `netlify.toml` both carry the one rule a
single-page app needs — rewrite every path to `index.html` — plus long cache headers for
hashed assets and no cache for the service worker.

- **Vercel**: import the repository; the framework preset is detected. Every pull request
  gets a preview deployment.
- **Netlify**: import the repository; `netlify.toml` sets the build command and publish
  directory. Deploy previews are on by default.

Nothing to configure and no secrets to add.

## CI

`.github/workflows/ci.yml` runs on every pull request and on `main`:
lint → typecheck → test with coverage → build → bundle report, then Playwright in a second
job. Dependencies and the Playwright browser are cached.

## Where to read next

- `ARCHITECTURE.md` — layers and import rules, where state lives, i18n and localized
  fields, how to add a feature slice, the decisions log, the deviations from the Figma
  comp, measured performance.
- `CLAUDE.md` — working context and the list of gotchas already hit.
- `docs/BUILD-PROMPTS.md` — the fourteen-step plan the project was built from.
