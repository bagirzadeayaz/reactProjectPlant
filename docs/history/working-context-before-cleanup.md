> Historical snapshot from before the architecture cleanup. For current behavior and working rules, read the root ARCHITECTURE.md and CLAUDE.md.

# Planto — working context

## Current backend migration (2026-09-24)

The active React code and assets now live under `frontend/`; the Node.js API and
Firestore access live under `backend/`. Production no longer starts MSW or stores
catalog changes in localStorage. `frontend/src/mocks` is test infrastructure only.
`README.md` and the newest decisions in `ARCHITECTURE.md` describe the current
setup. Historical prompt notes below predate this migration; follow the current
layout and the user's instruction when they conflict.

Read this first. It is loaded automatically at the start of every session.

## What this is

A React copy of a Figma design: a plant e-commerce landing page and catalog, with full
product CRUD, dynamic routing, Redux Toolkit state and EN/RU localization.

## The build plan

`docs/BUILD-PROMPTS.md` holds the full 14-step sequence. **All thirteen steps are done and in this
repo.** What remains is operational: connect the repository to Vercel or Netlify for the
live preview URL, and delete the legacy files listed under "Where step 13 stands".

Work one step at a time. Each prompt ends with a checkpoint; do not start the next step
until the current one passes. Before writing code in a step, state your plan in 5 lines or
fewer.

## Design source of truth

Use the Figma MCP tools — never guess at values.

- File key: `jgggt59SlkGZe4CEVwebOJ`
- Main frame: `22:2` (`MacBook Pro 16" - 2`), 1728 × 7558

**Ignore** frames `3:2` (older v1), `17:175` (scrap images), `22:233` and `22:235`
(a device mockup containing a byte-for-byte duplicate of `22:2` — it will waste your time
and produce contradictory values).

The Figma file has no published styles or variables. Every value in it is raw, which is why
the token layer in `src/index.css` is the design system rather than a mirror of one. Each
token there cites the node it came from; add the citation when you add a token.

## Ground rules

- TypeScript strict. No `any`, no non-null assertions, no `@ts-ignore` — all three are lint
  errors, not warnings.
- No component file over ~150 lines. Split before that.
- **No raw hex or pixel values in components.** Everything references a token from the
  `@theme` block in `src/index.css`. A literal color in a component is a defect.
- **Every user-visible string goes through i18n.** Never hardcode text, not even a
  placeholder. Add the key to the English bundle _and_ the Russian one — `npm run lint`
  fails if they diverge. Primitives in `src/shared/ui` take their text as props instead: a
  generic component owns no copy, so its caller supplies the translated string.
- Composition over props explosion. More than ~7 props means split it or take children.
- Write the test alongside the code, not after.

## Architecture

Feature-Sliced Design. Imports flow downward only:

```
app -> pages -> widgets -> features -> entities -> shared
```

This is enforced by `eslint-plugin-boundaries` as an **error**. An upward import fails
`npm run lint`. Do not downgrade or disable that rule — read `src/<layer>/README.md`
instead, each one states what belongs in its layer.

`ARCHITECTURE.md` has the full picture: layer rules, the state split (RTK Query owns server
state, plain slices own UI state — never copy one into the other), the token system, the
decisions log, and the running list of deliberate deviations from the Figma design.

**When you make a judgment call, append it to the decisions log in `ARCHITECTURE.md` in the
same commit.** When you deliberately differ from the comp, add it to the deviations table
with its reason. Both tables exist so nothing later looks like an accident.

## Commands

| Command                 | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Dev server                                              |
| `npm run lint`          | ESLint (type-aware, layer boundaries) + i18n key parity |
| `npm run check:i18n`    | EN/RU key and plural-form parity                        |
| `npm run typecheck`     | `tsc -b --noEmit`                                       |
| `npm test`              | Vitest                                                  |
| `npm run test:coverage` | Coverage, 80% threshold                                 |
| `npm run build`         | Typecheck then production build                         |

Run `lint`, `typecheck`, `test` and `build` at every checkpoint. All four must pass before
moving on.

## Gotchas already hit — don't rediscover these

- **Tailwind is v4 and CSS-first.** There is no `tailwind.config.ts` and there should not
  be one. Tokens live in the `@theme` block in `src/index.css`.
- **ESLint is pinned to 9**, and so is `@eslint/js` — its 10.x line demands ESLint 10, and
  `eslint-plugin-import` has no ESLint 10 support yet. `npm i -D @eslint/js` without a
  version will break install resolution.
- **`eslint-plugin-boundaries` is v7.** Use the `boundaries/dependencies` rule with
  `policies: [{ from: {...}, allow: { to: {...} } }]`. The older `element-types` shape still
  loads but only prints migration warnings.
- **Element patterns match folders, not files.** `pattern: 'src/App.tsx'` silently fails to
  classify; use `boundaries/ignore` for individual files.
- **No `baseUrl` in tsconfig** — deprecated with a hard error in TypeScript 6. `paths`
  resolves relative to the config file.
- **`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on.** Array indexing
  yields `T | undefined` — use `NonEmptyArray<T>` from `src/types` where the source really
  is non-empty. Optional properties will not accept an explicit `undefined`: spread
  conditionally, `{...(x === undefined ? {} : { x })}`, rather than passing `x={maybe}`.
  This will matter for zod-inferred types in step 5. Handle it, don't loosen the config.
- **jest-dom matchers need `vitest.setup.ts` inside `tsconfig.app.json`'s `include`.**
  Listing `@testing-library/jest-dom` in `types` does not bring the augmentation in.
- **Default exports are banned** outside `src/main.tsx`.
- **Type-aware rules must be switched off for plain `.js` files** (`eslint.config.js`
  itself), or ESLint fails to load before it lints anything.
- The page margin token is **77px**, not 67 or 74. The grid closes exactly at it:
  3 × 512 + 2 × 19 = 1574 = 1728 − (2 × 77). The navbar in the comp sits at 67 — that is a
  comp inconsistency, recorded in the deviations table.
- **`@typescript-eslint/no-invalid-void-type` rejects RTK Query's idiomatic `void` query
  arg.** Type no-argument endpoints as `undefined` and call `initiate(undefined)`.
- **`fetchBaseQuery` needs an absolute `baseUrl` under Node.** A relative `/api` throws
  `ERR_INVALID_URL` in every test. `shared/api/base-api.ts` builds it from
  `location.origin`; MSW matches by path, so the origin does not matter to the handlers.
- **A partial patch carries explicit `undefined` keys** under `exactOptionalPropertyTypes`.
  Strip them before spreading over an existing record, or you blank real values.
- **Reading `ref.current` during render is an ESLint error** (`react-hooks/refs`). Use a
  lazy `useState` initializer for per-mount values.
- **`HttpResponse` is generic** — do not annotate an MSW helper's return type with it bare;
  let TypeScript infer.
- **Do not assert "not fetching" in a cache test.** Right after an invalidation the cache
  still holds the previous fulfilled result, so the assertion passes without a refetch
  having happened. Wait for the expected value.
- **The Figma MCP has a per-plan call limit.** The Starter plan runs out after roughly a
  dozen `get_design_context` calls. Batch the nodes you need and read metadata first.
- **`.mjs` scripts need the same type-aware-rules exemption as `.js`**, or ESLint dies
  loading the config. The override matches `**/*.{js,mjs,cjs}`.
- **Russian needs four plural forms** (`_one`, `_few`, `_many`, `_other`); English needs
  two. `check:i18n` compares base keys across languages and plural forms within each.
- **A mount counter must live outside the component** to prove "no remount" — a ref is
  reset by the very remount it is meant to detect, and rendering it shows the pre-effect
  value.
- **Two effects syncing state to a URL will loop** when the setter is async, as
  `changeLanguage` is: each sees the other's stale value. Read on change, write only on a
  real change (`LanguageQuerySync` shows the shape).
- **`react-hooks/set-state-in-effect` is an error.** Derive from props/params during render
  instead — the header's mobile menu keeps `{ isOpen, pathname }` in one state value.
- **A code-split route has no `<h1>` when the path changes.** Anything that reads the
  heading on navigation must wait for it (MutationObserver), or it sees the Suspense
  fallback.
- **`i18n` from `shared/i18n` is uninitialised until something calls `initI18n()`.** A test
  that touches it before rendering `AppProviders` must call `initI18n()` itself; it is
  idempotent.
- **`changeLanguage` is async, so a pending switch can land after a test's cleanup.** Reset
  the language in `beforeEach`, not only `afterEach`.
- **jsdom cannot tell you about layout.** Overflow, CLS and image loading were only caught
  by rendering the built app in Chromium (`vite preview` + Playwright + Lighthouse). Do that
  at every visual checkpoint; the scripts are one-off but the recipe is in ARCHITECTURE.md.
- **`z.string().email()` and React's `FormEvent` are deprecated** under
  `@typescript-eslint/no-deprecated`. Use `z.email()` and `SubmitEvent<HTMLFormElement>`.
- **A page-level integration test that mounts `AppProviders` belongs in `src/app`**, not
  beside the page — `pages` may not import `app`, and the boundary rule is right to say so.
- **A widget test may not import `app/store` either.** The header test builds its own
  `configureStore` from `entities/cart` + `shared/api`; copy that shape.
- **Two "Increase quantity" / "Clear filters" buttons can coexist** (page stepper + drawer
  line; filter form + empty state). Scope queries with `within(dialog)` or index
  `getAllByRole` — do not rename the buttons to dodge the test.
- **`setSearchParams` in a debounced handler must pass `{ replace: true }`**, or every
  keystroke becomes a history entry and the back button walks through the search.
- **The router is a data router now.** `useBlocker` needs it. Mount the app in tests with
  `renderApp(path)` from `src/app/testing/render-app.tsx` — it returns the router, so
  `router.navigate('/catalog')` (inside `act`) is how a test moves between pages.
- **`userEvent.upload` silently drops files that fail the input's `accept`.** Pass
  `{ applyAccept: false }` to test the component's own type validation.
- **Zod v4 issues carry `origin`, `minimum`, `expected`, `format`** — `issueMessage` keys on
  those. `.int()` fails as `invalid_type` with `expected: 'int'`, not as a separate code.
- **A navigation guard and a "navigate after save" in the same handler conflict** — see
  decision 53. Set state, navigate from an effect.
- **Do not put a test helper that imports `@testing-library` in a barrel** that production
  code re-exports. `src/app/testing` is imported directly by tests and excluded from
  coverage.
- **Rolldown keeps a module in the entry chunk if the entry can reach it through a barrel**,
  even when the entry uses none of its exports and the module is marked pure or
  side-effect-free. To keep a dependency out of the entry, cut the import edge: type-only
  re-exports in the barrel, deep imports for the runtime consumers (decision 56).
- **Lighthouse's simulated throttling cannot see the app shell.** It infers first paint from
  an unthrottled trace, and on localhost React renders before the first frame. Use
  `--throttling-method=devtools` to measure what a phone actually shows.
- **`userEvent`/Playwright `mouse.wheel` jumps never intersect** the elements they skip —
  an IntersectionObserver alone leaves them hidden. `Reveal` also listens to scroll.
- **`useLocation().pathname` as a key on the Outlet wrapper** remounts the page on every
  path change (that is the point of the fade) but not on query changes.

## Where step 13 stands

**Done, except the part that needs an account.** Tests: unit (hooks, reducers, selectors,
helpers), component (every `shared/ui` primitive and entity component), integration
(`src/app/*.test.tsx`, including `flows.test.tsx` for the three journeys and
`a11y.test.tsx`), e2e (`e2e/*.spec.ts`, Playwright, desktop + Pixel 7, `npm run e2e`).
Coverage thresholds at 80% on all four measures, enforced by `test:coverage` in CI.
`.github/workflows/ci.yml`: lint → typecheck → test → build → bundle report → e2e, with
npm and browser caches. `vercel.json` + `netlify.toml` carry the SPA rewrite. README and
ARCHITECTURE.md rewritten to the brief.

Not done, because it cannot be done from inside the repository: the live preview URL.
Import the repo into Vercel or Netlify; nothing else is needed.

Delete these — nothing imports them, and they are excluded from coverage and Prettier only
so that the migration diffs stayed readable:

- `src/components/`, `src/data/`, `src/store/`, `src/types/`
- `src/features/product-filters/model/filters-slice.ts` and `filters-slice.test.ts`
- `src/app/routes/legacy-home.tsx` if it still exists

Then remove the `legacy` element and its policy from `eslint.config.js`, the four exclude
lines from `vite.config.ts` coverage, the four lines from `.prettierignore`, and the
`--color-plant-*` block from `src/index.css`.

## Where step 12 stands

**Done, with one number short.** axe: zero violations on every route and every open
dialog (`src/app/a11y.test.tsx`). Contrast measured in Chromium (≥ 7.8:1 on the hero, no
scrim needed). Reduced motion is a global rule plus `motion-safe` gating; `Reveal` does the
scroll-reveal; pages fade in on client-side navigation only. `StatusPage` styles the 404
and the route error fallback. Images ship AVIF/WebP/PNG through `<picture>`
(`npm run images`). `npm run build:report` prints chunks and fails over 200 KB gzip.

Lighthouse: desktop 99/100/100/100 on `/` and `/catalog`; mobile 84–88 performance with
LCP 3.1–3.7 s simulated — the entry JS (166 KB gzip, down from 186) is the floor without
pre-rendering. See ARCHITECTURE.md "Measured" for the table and decisions 54–61 for what
was done about it.

## Where step 11 stands

**Done.** `/admin/products` (`pages/admin-products`: sortable, searchable table, bulk
select and delete behind a confirmation modal) and `/admin/products/new|:id`
(`pages/admin-product-form` + `features/product-form`: React Hook Form on
`productDraftSchema`, side-by-side EN/RU with an empty-language warning, URL or drag-and-drop
image as a data URL, unsaved-changes guard via `useBlocker`). Update/delete are optimistic
with rollback and an error toast (`entities/product/api/optimistic.ts`). Access is the
`planto:admin` flag behind `features/admin-access`; README says it is a mock.

Checkpoint passes in jsdom and in Chromium: a product created in the admin is on `/catalog`
and the home grid without a refresh. 266 tests, coverage 94/90/89/95.

## Where step 10 stands

**Done.** `src/pages/catalog` (filters, live result count, skeleton/empty/error states,
numbered pagination) and `src/pages/product` (gallery, quantity stepper, related products,
real 404 for an unknown slug). Catalog state is the URL — `features/product-filters` now
exports `useCatalogParams` and `CatalogFilters`; the old filters slice is dead code on disk.
The cart persists under `planto:cart` and opens as a modal drawer (`widgets/cart-drawer`)
from the header badge. Titles and meta come from `react-helmet-async`.

Verified in Chromium at 320/768/1440: no overflow, filters round-trip through the URL,
cart survives a reload. 237 tests, coverage 93/89/87/94.

## Where steps 8–9 stand

**Done.** `src/pages/home` composes eight sections from `src/widgets/home` (Hero,
FeaturedProductCard, ProductBanner, ProductGrid, ReviewCarousel, BestO2) and the entity
cards (`entities/product/ui/ProductCard`, `entities/review/ui/ReviewCard`). Two features
landed with it: `add-to-cart` (icon and label variants, toast on add) and `newsletter` (a
real form — zod validation, busy state, success/error toasts).

Verified in a headless browser, not only in jsdom: rendered at 320/768/1440/1728 with no
horizontal overflow, every image loading with reserved dimensions, Lighthouse desktop 99/100
and mobile 85/100, CLS 0.02. The three fixes that came out of that — render before MSW,
non-blocking fonts, reserved boxes for async sections — are decisions 31–33.

The legacy `src/components` tree is no longer routed. `src/app/routes/legacy-home.tsx` is
gone.

## Where step 7 stands

**Done.** `src/app/router` holds the route table, the layout shell and the language/URL
sync; `src/widgets/header` and `src/widgets/footer` are built from nodes 22:23 and 22:209.
Every route is lazy-loaded, so the build now emits a chunk per page.

Accessibility is the substance of this step: a skip link as the first tab stop, focus moved
to the new page's `<h1>` after navigation, the page name announced in a polite live region,
scroll reset, `aria-current` on the active link, and a hamburger disclosure with
`aria-expanded`/`aria-controls` that closes on Escape and returns focus to its toggle.

`src/pages/{catalog,product,admin-products,admin-product-form,not-found}` are shells — a
heading and nothing else. Prompts 8-11 fill them.

## Where step 6 stands

**Done.** `src/shared/i18n` holds the config, the six namespaces (`common`, `home`,
`catalog`, `product`, `admin`, `validation`) as JSON per language, `useLocale` (active
language, setter, and the reader for the `{ en, ru }` entity fields from step 5) and
`useFormatters` (Intl currency/number/date — never hand-rolled).

`t()` is typed from the English bundle, so a key that does not exist is a compile error.
`scripts/check-i18n-keys.mjs` covers what types cannot: a Russian key that was never
written, and a missing plural form. It runs inside `lint` and `build`.

Detection is URL (`?lang=`) → `localStorage` (`planto:lang`) → navigator, defaulting to
English; `<html lang>` and `document.title` follow the active language. `LanguageSwitcher`
lives in `src/features/language-switcher` and is on `/ui-kit`.

## Where step 5 stands

**Done.** The domain lives in `src/entities/{product,review,category}/model/schema.ts` as
zod schemas with types inferred from them; `name`, `description` and `text` are
`{ en, ru }` objects so the language switch needs no refetch. `src/mocks` is the MSW
backend — seeded from the comp node by node, persisted to `localStorage` under
`planto:db`, and running in dev, in tests and in a static deploy. The store is in
`src/app/store`, with RTK Query endpoints injected per entity and tag invalidation on every
mutation; `entities/cart` and `features/product-filters` hold the UI-only state.

140 tests pass, including CRUD round-trips through MSW, cache invalidation against a live
subscription, persistence across a simulated reload, and the list endpoint's search
(both languages), filter, sort and pagination.

## Where step 4 stands

**Done.** `src/shared/` holds `lib/cn` (class merge extended with the project's scales) and
`ui/`: Button (polymorphic, variants, loading), Input, Textarea, Select, Card, Container,
Section, Icon, Skeleton, Spinner, EmptyState, ErrorState, Modal and Toast — each with a
unit test covering its interactive behaviour. `/ui-kit` renders all of them and is mounted
behind `import.meta.env.DEV`, so it never ships.

Modal and Toast are keyboard-accessible: focus trap, focus restored on close, Esc to
dismiss, correct ARIA roles. The tests assert each of those, including tab wrap in both
directions.

Match the patterns already there rather than inventing new ones — in particular: take copy
as props, keep variant class maps in a sibling `variants.ts`, and spread optional props
conditionally.
