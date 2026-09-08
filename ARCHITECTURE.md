# Planto — architecture

A React copy of a Figma design: a plant e-commerce landing page and catalog, with product
CRUD, dynamic routing, Redux Toolkit state and EN/RU localization.

- **Design source of truth:** Figma `jgggt59SlkGZe4CEVwebOJ`, frame `22:2`
  (`MacBook Pro 16" - 2`, 1728 × 7558).
- **Build plan:** `docs/BUILD-PROMPTS.md`.
- **Working rules for agents:** `CLAUDE.md`.

---

## Layers

Feature-Sliced Design. Imports flow downward only:

```
app  ->  pages  ->  widgets  ->  features  ->  entities  ->  shared
```

Each layer has a `README.md` stating what belongs in it. The rule is enforced by
`eslint-plugin-boundaries` as an **error**, via the `boundaries/dependencies` rule in
`eslint.config.js` — an upward import fails `npm run lint`. Do not relax it.

| Layer      | Holds                                             | May import         |
| ---------- | ------------------------------------------------- | ------------------ |
| `app`      | Providers, router, global styles, store setup     | everything below   |
| `pages`    | One folder per route; composes widgets            | widgets and below  |
| `widgets`  | Self-contained page blocks (header, product grid) | features and below |
| `features` | User actions (add to cart, switch language)       | entities, shared   |
| `entities` | Business nouns (plant, review, cart)              | shared             |
| `shared`   | UI kit, helpers, config — zero business knowledge | shared             |

### Adding a feature slice

A feature is one user action. To add "wishlist":

1. `src/features/wishlist/` with `model/` (a slice or a hook), `ui/` (the button), `lib/`
   (pure helpers) as needed, and an `index.ts` that exports only what a widget or page
   should touch. Nothing outside the slice imports a file below its `index.ts` — the
   exception is `entities/*/model/schema.ts`, which the mock backend and the admin form
   import directly so zod stays out of the storefront bundle (decision 56).
2. It may import `entities` and `shared`. If it needs another feature, that is a widget's
   job: compose them one layer up.
3. Copy goes into `src/shared/i18n/locales/{en,ru}/<namespace>.json` — both languages, or
   `npm run lint` fails. Reuse a namespace when the strings belong to a screen that
   already has one.
4. Tokens only: a colour or size that does not exist in `src/index.css` gets added there,
   with the Figma node it came from, and registered in `src/shared/lib/cn/cn.ts` if it is a
   new scale name.
5. Tests beside the code: `*.test.ts(x)` in the slice for units and components; anything
   that mounts `AppProviders` goes in `src/app/` with `renderApp`.

### The legacy tree

`src/components`, `src/data`, `src/store` and `src/types` predate this structure and are no
longer imported by anything. They are classified as a `legacy` element so the linter does
not have to be told about them twice. Delete them (see Known rough edges).

`src/App.tsx` and `src/main.tsx` sit outside the layer graph (`boundaries/ignore`).

---

## State

Two stores that never copy from each other:

- **RTK Query owns server state.** Anything that came from an API is cache, not state.
  Read it with a query hook; never mirror a query result into a slice.
- **Plain slices own UI state.** The cart (persisted to `localStorage` under `planto:cart`)
  and nothing else so far.
- **The URL owns catalog state.** Search, category, price range, stock, sort and page are
  query parameters read by `useCatalogParams`. A slice would be a second copy of what the
  address bar already says, and would not survive a shared link.

The failure this rule prevents: a component reads a stale copy of a plant from a slice
while RTK Query already has a fresher one, and the two disagree on screen.

Mutations invalidate tags, so every mounted list refetches after a create, update or
delete. Update and delete also patch the cache first and undo on failure (decision 49).
The store is built per mount by `makeStore()` — the app calls it once, every test gets a
fresh one — and the cart is the only slice that persists (`planto:cart`).

## i18n and localized fields

Two different things, deliberately kept apart:

- **UI copy** is `react-i18next`. Six namespaces (`common`, `home`, `catalog`, `product`,
  `admin`, `validation`) as JSON per language under `src/shared/i18n/locales`, bundled at
  build time. `t()` is typed from the English bundle (`i18next.d.ts`), so a key that does
  not exist is a compile error; `scripts/check-i18n-keys.mjs` catches what types cannot —
  a Russian key never written, a missing plural form (Russian needs `_one/_few/_many/
_other`). Detection: `?lang=` → `localStorage` (`planto:lang`) → browser, English
  default; `LanguageQuerySync` keeps the query and the active language in agreement.
- **Content** is localized in the data, not translated by the UI. A product's name is
  `{ en, ru }` (`LocalizedString`), read through `useLocale().localized`, so switching
  language re-reads the same cached object and refetches nothing. The mock backend
  searches both languages. The admin form edits both side by side and warns when one is
  empty.

Formatting never hand-rolls: `useFormatters(locale)` wraps `Intl` for currency, numbers and
dates.

---

## The token system

The Figma file publishes **no styles and no variables** — every value in it is raw. So the
`@theme` block in `src/index.css` _is_ the design system rather than a mirror of one. Every
token cites the Figma node it was read from.

Rules:

- **No raw hex or pixel values in components.** A literal color in a component is a defect.
- Tailwind is **v4 and CSS-first**. There is no `tailwind.config.ts` and there should not be
  one.
- `src/shared/lib/cn` extends `tailwind-merge` with the project's own scale names. A token
  added to `@theme` that a component might override belongs in that list too — otherwise a
  caller's `rounded-icon` will not beat a component's `rounded-control`.

### Layout

The comp is 1728 wide with a 77px page margin. The card grid closes exactly on it:

```
3 × 512 + 2 × 19 = 1574 = 1728 − (2 × 77)
```

---

## Decisions log

Append to this table when you make a judgment call, in the same change.

| #   | Decision                                                                                               | Why                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `NonEmptyArray<T>` in `src/types`, used for `trendyPlants` / `topSellingPlants`                        | `noUncheckedIndexedAccess` makes `xs[0]` return `T \| undefined`. Components legitimately read a first element. Typing the source as non-empty fixes it once, instead of scattering guards or non-null assertions through the views.                                                                                                                                        |
| 2   | Ref passed as a plain prop; no `forwardRef`                                                            | React 19 makes `ref` an ordinary prop on function components. `forwardRef` still works but is on its way out, and the union prop types are cleaner without it. Button, Input, Textarea and Select all expose their DOM node this way.                                                                                                                                       |
| 3   | `Button` uses a discriminated union on `as`, not a generic polymorphic type                            | Generic `as` types are the usual place `any` leaks into a UI kit. Two concrete members (`'button'`, `'a'`) cover every use in this design and stay fully checked.                                                                                                                                                                                                           |
| 4   | Native `<select>` rather than a custom listbox                                                         | The platform control already has keyboard support, type-ahead and the mobile picker. A custom one would be a large a11y surface for no design gain.                                                                                                                                                                                                                         |
| 5   | `Modal` is a portalled `div[role=dialog]`, not `<dialog>`                                              | `showModal()` behaviour is uneven under jsdom, which would make the focus-trap tests unreliable — and the trap is the part most worth testing.                                                                                                                                                                                                                              |
| 6   | `tailwind-merge` extended with the project's scales                                                    | Without it a caller's override sits beside the component default and both apply, so the winner is stylesheet order rather than call order.                                                                                                                                                                                                                                  |
| 7   | Coverage thresholds exclude the legacy tree and `/ui-kit`                                              | Holding not-yet-migrated code to 80% would mean writing tests for components that are about to be replaced. `src/shared` and new layers are fully counted.                                                                                                                                                                                                                  |
| 8   | Escape clears the whole toast stack when the region has focus                                          | A keyboard user should never have to wait out a timer.                                                                                                                                                                                                                                                                                                                      |
| 9   | Localized fields are objects (`{ en, ru }`), not server-chosen strings                                 | The app switches language without refetching, so a product carries both translations and the UI picks one. `pickLocalized` falls back to `en`.                                                                                                                                                                                                                              |
| 10  | `src/mocks` sits outside the layer graph (`boundaries/ignore`)                                         | MSW is dev and test infrastructure that needs entity types — something no layer below `app` may reach for. Classifying it as a layer would either lie about the graph or force the seed data into `shared`.                                                                                                                                                                 |
| 11  | `tagTypes` for RTK Query live in `shared/api`                                                          | RTK Query requires every tag to be declared on the root api. Three business nouns in `shared` is the smallest possible leak; endpoints themselves are injected from each entity.                                                                                                                                                                                            |
| 12  | Query args are typed `undefined`, not RTK Query's idiomatic `void`                                     | `@typescript-eslint/no-invalid-void-type` rejects `void` in a union or generic. `undefined` means the same thing and costs one explicit `initiate(undefined)` at the call site.                                                                                                                                                                                             |
| 13  | `fetchBaseQuery` builds an absolute base URL from `location.origin`                                    | Node's fetch rejects a relative URL and the test runner uses it. MSW matches by path, so the origin is irrelevant to the handlers.                                                                                                                                                                                                                                          |
| 14  | PATCH strips `undefined` keys before merging                                                           | Under `exactOptionalPropertyTypes` an absent field arrives as an explicit `undefined`; spreading it over the existing record would blank real values.                                                                                                                                                                                                                       |
| 15  | The cache-invalidation tests wait for the expected value, not for "not fetching"                       | Right after an invalidation the cache still holds the previous fulfilled result, so a status check passes instantly and asserts nothing.                                                                                                                                                                                                                                    |
| 16  | `msw` is a runtime dependency, not a dev one                                                           | It is the app's backend in a static deploy, so it ships. `public/mockServiceWorker.js` is generated by `npx msw init public` and is committed.                                                                                                                                                                                                                              |
| 17  | Both languages are bundled, not lazy-loaded                                                            | Two languages and a few kB of copy. Splitting them buys a round trip's worth of flicker on every switch and saves nothing worth measuring.                                                                                                                                                                                                                                  |
| 18  | Detection order is URL → localStorage → navigator                                                      | A shared link opens in the language it was shared in, even for someone whose own preference is the other one. The choice is then persisted under `planto:lang`.                                                                                                                                                                                                             |
| 19  | `t()` is typed from the English bundle; parity is enforced by a script                                 | Types catch a typo in a key, but a _missing Russian_ key is a silent runtime fallback that looks fine to anyone testing in English. `npm run check:i18n` catches that, and it runs inside `lint` and `build`.                                                                                                                                                               |
| 20  | The parity script compares plural _base_ keys, then each language's own `Intl.PluralRules` categories  | English needs `one`/`other`; Russian needs `one`/`few`/`many`/`other`. A naive key diff would either demand `results_few` in English or let a missing Russian `few` through.                                                                                                                                                                                                |
| 21  | `LanguageSwitcher` is a group of toggle buttons, not a `<select>`                                      | Two options: both stay visible and one click moves between them. `aria-pressed` carries the state and each button is tagged with its own `lang` so the label is pronounced correctly.                                                                                                                                                                                       |
| 22  | One i18next instance for the process; the store is per mount                                           | A language change is global and `<html lang>` needs a single owner, whereas a per-mount store is what keeps tests isolated.                                                                                                                                                                                                                                                 |
| 23  | Language is a query parameter (`?lang=ru`), not a path prefix                                          | The app is a static deploy with no server able to rewrite `/ru/...`, and a prefix would double every entry in the route table for content that differs only in its strings. It also keeps one canonical URL per page, so a bookmark and a shared link point at the same route whatever language the reader prefers.                                                         |
| 24  | `LanguageQuerySync` reads the URL on change but writes it only on a real language change               | `changeLanguage` is async, so two naive effects each see the other's stale value and overwrite it forever — the first version of this component looped until the test runner was killed. A URL with no `lang` is left alone so an ordinary link keeps its shape.                                                                                                            |
| 25  | The route announcer waits for the page's `<h1>` via a MutationObserver                                 | Every route is code-split, so at the moment the path changes the page is still a Suspense fallback. Reading the heading immediately announces the raw URL and leaves focus on the spinner. Falls back to the pathname after 2s.                                                                                                                                             |
| 26  | The landing page lives at `app/routes/legacy-home.tsx`, not `pages/home`                               | `app` is the one layer allowed to reach into the legacy tree, so wiring the existing page into the new router costs no boundary exemption. Prompts 8-9 rebuild it as a real `pages/home` and the file goes away.                                                                                                                                                            |
| 27  | The mobile menu's open state is derived from the pathname, not closed in an effect                     | `{ isOpen, pathname }` in one state value closes the panel on any navigation — a link inside it, the logo, the back button — without a second render on every route change. `react-hooks/set-state-in-effect` rejects the effect version.                                                                                                                                   |
| 28  | The mobile menu is a disclosure, not a dialog — no focus trap                                          | It sits in the document flow directly after its button and pushes the page down rather than covering it, so trapping focus would be wrong. Escape still closes it and returns focus to the toggle.                                                                                                                                                                          |
| 29  | Error boundaries at two levels: one per route, one at the root                                         | The route-level boundary is keyed on the pathname, so the header, footer and nav survive a page that throws and the user can navigate away. The root boundary has nothing left to preserve, so its recovery is a reload.                                                                                                                                                    |
| 30  | `React.lazy` via a `lazyNamed` helper                                                                  | Default exports are banned in this project, so every route import maps its named export onto the `default` key `lazy` expects — in one place rather than repeated per route.                                                                                                                                                                                                |
| 31  | The app renders before MSW is ready; the first _request_ waits instead                                 | Awaiting the worker before render put its whole chunk in front of first paint. `shared/api/backend-ready.ts` is a one-shot gate the base query awaits; `main.tsx` opens it when the worker starts (or fails). Tests open it in setup.                                                                                                                                       |
| 32  | Fonts load from `index.html` as a print stylesheet promoted on load                                    | A CSS `@import` of Google Fonts is render-blocking. The `media="print"` + `onload` pattern is the non-blocking form that needs no JS bundle. The unused Inter/Poppins link was removed.                                                                                                                                                                                     |
| 33  | Every async section reserves its final box while loading                                               | Rendering the shell first made the footer appear at the top and jump 3000px when data arrived (CLS 0.5). Product cards are a fixed 644px (node 22:95), skeletons match slot for slot, and `<main>` is `min-h-dvh` so the footer starts below the fold. CLS is now 0.02.                                                                                                     |
| 34  | `ProductCard` exposes one link, not two                                                                | The picture and the name both link to the product; the picture's link is `aria-hidden` and out of the tab order so a screen reader hears one link per card, not two identical ones.                                                                                                                                                                                         |
| 35  | The product grid is `repeat(3, 1fr)` with `gap-gutter` at the content width, not fixed 512px tracks    | Three fluid tracks in a 1574px container come out at exactly 512px, so the comp's geometry holds at 1728 while the same grid reflows to 2-up and 1-up without a second definition.                                                                                                                                                                                          |
| 36  | Button's 180px minimum applies from `sm`, not everywhere                                               | At 320px a 180px button beside a 40px icon inside 48px of padding forced the featured card to 338px and the whole page to scroll sideways. The comp's value is a desktop value.                                                                                                                                                                                             |
| 37  | Product images are served as 400/800/1200 WebP with a PNG fallback, generated from the repo's cut-outs | The comp uses transparent cut-out plants; the repo already had six at 1563px. `productImageSources` derives the srcset from the slug, so a product added through the admin form with an arbitrary URL simply gets no srcset.                                                                                                                                                |
| 38  | Home data is two requests, not eight                                                                   | The landing page shows six products and three reviews. `useHomeData` fetches the catalog once and lets each section slice the same cached list.                                                                                                                                                                                                                             |
| 39  | Catalog filters live in the URL; the filters slice is gone                                             | Shareable and bookmarkable for free, back button works, deep links from the home page are one `<Link>`. `writeCatalogParams` omits defaults so `/catalog` stays clean and keeps `lang`. Any filter change resets `page`.                                                                                                                                                    |
| 40  | Search is debounced in the field, not in the hook                                                      | 300ms after the last keystroke the draft is pushed to the URL. The timer is armed in the change handler, so the only effect is cleanup. An external URL change (back, clear) is adopted during render, distinguished from our own push by `pushed`.                                                                                                                         |
| 41  | Numbered pagination, not infinite scroll                                                               | A page number is a URL and a footer stays reachable. Six per page — two rows of the comp's grid. `Pagination` is a `nav` with `aria-current="page"`.                                                                                                                                                                                                                        |
| 42  | Product gallery thumbnails reframe one image                                                           | The seed has one photo per plant. Three thumbnails apply `object-position` crops of it rather than showing three identical pictures; when real galleries arrive the same component takes a list.                                                                                                                                                                            |
| 43  | Cart persistence is a store subscriber, not middleware                                                 | `makeStore` preloads from `loadCart()` and writes on every change of the `cart` slice reference. `loadCart` validates the shape, so a corrupt or foreign value under the key is ignored rather than crashing the app.                                                                                                                                                       |
| 44  | The cart drawer is a modal dialog                                                                      | `role="dialog" aria-modal`, focus trapped (`useFocusTrap` from `shared/ui/modal`), Esc and backdrop close, focus returns to the badge. Line names and prices are joined from the products query on open, so the cart slice stores ids and quantities only.                                                                                                                  |
| 45  | An unknown slug is a real 404                                                                          | `useGetProductBySlugQuery` yields a 404 error and the page renders `NotFoundPage` in place, so the URL and the document title match the state the user sees.                                                                                                                                                                                                                |
| 46  | The router is a data router                                                                            | `useBlocker` (the unsaved-changes guard) only exists on `createBrowserRouter`. `appRoutes` is a route array; the app builds a browser router from it, tests a memory router (`app/testing/render-app`). `LanguageQuerySync` moved into a pathless root route because it needs router context.                                                                               |
| 47  | Admin access is a localStorage flag, not auth                                                          | The app has no server to authenticate against. `RequireAdmin` shows a page that says it is a demo and one button to enter; README says the same. Pretending harder would be a lie with more code.                                                                                                                                                                           |
| 48  | The form validates with the entity schema, worded by `issueMessage`                                    | `productDraftSchema` is what the mock backend checks too, so the form cannot accept what the server refuses. Messages are keyed on the zod issue (code, origin, minimum) rather than the field, through the resolver's `error` option — no second rule set, no per-field copy.                                                                                              |
| 49  | Update and delete are optimistic; create is not                                                        | `onQueryStarted` patches every cached `getProducts` page and single product (`selectCachedArgsForQuery`) and undoes them if the request fails, with an error toast. A create has no id until the server answers, so it waits — the button's loading state covers the gap.                                                                                                   |
| 50  | The draft slug may be empty                                                                            | The server derives a unique slug from the English name; the form says so. `productDraftSchema.slug` is `z.string()` rather than `min(1)`, and PATCH drops an empty slug so an edit never blanks one.                                                                                                                                                                        |
| 51  | Uploaded images become data URLs, capped at 300 KB                                                     | The mock backend persists to localStorage (~5 MB), so a file is validated for type and size before it is read, and the hint says where it goes. A real backend would take multipart and return a URL; only `ImageField` would change.                                                                                                                                       |
| 52  | The admin table sorts and searches on the client                                                       | One `getProducts` call at `perPage: 100` shares the cache with the storefront, so a delete is gone from the catalog before the invalidation refetch lands. Server-side sort/search exists in the mock but is not what a six-row table needs.                                                                                                                                |
| 53  | Leaving after a save happens in an effect                                                              | The guard re-registers its blocker in its own effect (child before parent). Navigating from the submit handler would hit the stale blocker and ask "discard changes?" about changes that were just saved.                                                                                                                                                                   |
| 54  | axe runs in the test suite, per route and per open dialog                                              | `src/app/a11y.test.tsx` mounts the real app at every path and asserts zero violations, plus the cart drawer, the mobile menu and the delete dialog open. Colour contrast is excluded there (jsdom has no layout) and measured in Chromium instead — pixel-sampled worst case behind each text box, ≥ 7.8:1 on the hero without a scrim, so none was added.                  |
| 55  | Reduced motion is one CSS rule, not a hook                                                             | `@media (prefers-reduced-motion: reduce)` collapses every animation and transition in `index.css`; `Reveal` and the page fade are also gated on `no-preference`. A per-component hook would have to be remembered; a stylesheet rule cannot be forgotten.                                                                                                                   |
| 56  | The storefront ships no zod                                                                            | zod is ~22 KB gzip and only the mock backend and the admin form parse anything. Entity barrels export types only; `localizedString` lives in `shared/api/localized-schema.ts`; the newsletter validates with the HTML e-mail pattern. Rolldown keeps a module reachable through a barrel in the entry chunk, so the split had to be at the import graph, not by annotation. |
| 57  | `react-helmet-async` replaced by `DocumentMeta`                                                        | Three tags per page (title, description, robots) do not need a provider and a dependency in the entry bundle. Forty lines, one effect.                                                                                                                                                                                                                                      |
| 58  | The landing page is not code-split; the mock backend starts after first paint                          | Home is where visits begin, so its lazy chunk was a second hop before first paint. MSW's chunk is the largest on the page and used to load in the same tick as the render; starting it after the first frame keeps it off the critical path.                                                                                                                                |
| 59  | An app shell in `index.html`                                                                           | The header bar and, on `/`, the hero photograph, painted from HTML before any script. Decorative and untranslated on purpose. With applied throttling the landing LCP is 1.6 s instead of 3.1 s; Lighthouse's default simulation cannot see it (it infers FCP from an unthrottled trace where React beat the first frame).                                                  |
| 60  | Memoisation stays where it guards identity, and nowhere else                                           | `useLocale`, `useFormatters` and `ToastProvider` memoise context values and `Intl` formatters — those change behaviour, not just speed. No `React.memo` or speculative `useCallback` exists in components; none was added.                                                                                                                                                  |
| 61  | AVIF before WebP before PNG, through `<picture>`                                                       | `ResponsiveImage` groups typed sources into `<source>` elements; `scripts/generate-images.mjs` makes the variants. AVIF is roughly 40% of the WebP bytes here.                                                                                                                                                                                                              |

---

## Deliberate deviations from the comp

| Area                      | Comp                                              | Implementation                                                            | Why                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body and display typeface | Inter (every text node)                           | Manrope for body, Syne for display                                        | Already loaded and in use across the existing pages before the token pass. The comp's Inter is a Figma default rather than a chosen brand face. Revisit before launch — changing it is a one-line change in `@theme`. |
| Navbar left edge          | `x = 67` (node 22:23)                             | `77px` page margin                                                        | The rest of the comp — every card column — closes on 77. The navbar is 10px off the grid; treating it as the margin would break the arithmetic above.                                                                 |
| Legacy palette            | Photography over a dark ground, white at 75%      | `--color-plant-*` dark greens                                             | The pre-token pages are painted with these. Kept alongside the Figma tokens so that tree keeps rendering; new code must not reference them. Removed when prompts 8–11 finish the migration.                           |
| Section radius            | `151px` on the pill panels (node 22:65)           | Same, as `--radius-panel`                                                 | No deviation — recorded because the value looks like a typo and is not.                                                                                                                                               |
| Body copy                 | Lorem ipsum throughout                            | Written English per product, with a Russian translation of that English   | Lorem cannot be translated, and the EN/RU switch needs real strings on both sides to be testable. Names and prices are the comp's, node by node.                                                                      |
| Product images            | Photographic plants in the comp                   | Generated plant cut-outs in `public/plants/`, AVIF/WebP/PNG               | Same network constraint as the hero. Drop the real photographs in under the same names and run `npm run images`.                                                                                                      |
| `/ui-kit` copy            | n/a                                               | Kept in a local `COPY` object, not in the i18n bundles                    | The route is stripped from production builds. Shipping dev-tool labels to every visitor, and asking a translator to translate them, would be worse than the rule it bends.                                            |
| Nav labels                | Home / Plant Type's / More / Contact (node 22:23) | Home / Catalog / Manage                                                   | Only Home has a destination in the comp. These are the routes that exist; "More" and "Contact" have nothing to point at.                                                                                              |
| Mobile header             | No mobile design in the comp                      | Nav collapses behind a hamburger below `lg`                               | The comp is a single 1728px frame. The disclosure pattern was designed to match its chrome.                                                                                                                           |
| Hero background           | Unsplash photograph (node 22:3)                   | Generated dark-green bokeh field                                          | No network in the build environment to fetch the photograph. `public/images/hero-bg.*` is a drop-in slot: replace the files, nothing else changes.                                                                    |
| Leaf motif                | Vector shapes beside each heading (22:62/63 etc.) | Redrawn leaf on the same 68 × 69 box                                      | The comp's vectors were not exportable when the tokens were read. Decorative and `aria-hidden` either way.                                                                                                            |
| Card radius               | Vectors (22:24, 22:95) — radius not readable      | `--radius-card: 36px`                                                     | The pill radius (151px) is for the wide banners; a tall card at 151px reads as a capsule. 36 sits between the control and panel radii.                                                                                |
| Reviewer avatars          | Unsplash portraits (22:152)                       | Generated abstract avatars                                                | Same network constraint; `public/avatars/` is a drop-in slot.                                                                                                                                                         |
| Best-O₂ copy              | Lorem ipsum (22:196–198)                          | The section title from the comp, then the _current_ product's description | The pager steps through real products, so the copy under it changes with the product rather than staying static.                                                                                                      |
| Newsletter                | A rectangle with placeholder text (22:226)        | A real labelled form with validation, busy state and toasts               | The comp gives the look only; a static rectangle would fail the accessibility and interaction requirements.                                                                                                           |
| Catalog, product, admin   | Not in the comp                                   | Composed from the comp's tokens and primitives                            | The comp is one landing frame. Every other screen reuses its cards, controls, type scale and radii rather than inventing a second language.                                                                           |
| Flattened groups          | Deeply nested auto-layout frames                  | One element per visual box                                                | The comp's frame nesting is a drawing artefact; reproducing it would add wrappers with no layout role.                                                                                                                |
| Responsive layouts        | 1728px only                                       | Stacks below `xl`, single column below `sm`, display size clamps          | Invented, since the comp has one width. Verified at 320/768/1440/1728 for overflow.                                                                                                                                   |
| Hero scrim                | —                                                 | None                                                                      | Considered in prompt 12; measured contrast behind the copy is ≥ 7.8:1 without one, so the photograph stays untouched.                                                                                                 |

---

## Routing

| Path                  | Page                                                            |
| --------------------- | --------------------------------------------------------------- |
| `/`                   | Landing page                                                    |
| `/catalog`            | Product list — filters, sort and search belong in the URL query |
| `/catalog/:slug`      | Product detail                                                  |
| `/admin/products`     | Product management table                                        |
| `/admin/products/new` | Create                                                          |
| `/admin/products/:id` | Edit                                                            |
| `/ui-kit`             | Dev only — stripped from production builds                      |
| `*`                   | 404                                                             |

Every route except the landing page is code-split (decision 58). The router is a data
router (`createBrowserRouter`, decision 46). `AppLayout` provides the skip link, header,
`<main>`, footer and the route announcer; the Suspense fallback and the route error
boundary sit _inside_ `<main>`, so a page that is loading or has thrown still leaves the
user somewhere to navigate from. `/admin/*` sits behind `RequireAdmin` (decision 47).

## Testing

| Level       | Where                                                                                          | Runs with                |
| ----------- | ---------------------------------------------------------------------------------------------- | ------------------------ |
| Unit        | `*.test.ts` beside hooks, reducers, helpers                                                    | Vitest, jsdom            |
| Component   | `*.test.tsx` beside every `shared/ui` and entity component                                     | Vitest + Testing Library |
| Integration | `src/app/*.test.tsx` — the real app on a memory router, MSW as backend, axe on every route     | Vitest                   |
| E2E         | `e2e/*.spec.ts` — the production build in Chromium, desktop and Pixel 7, MSW worker as backend | Playwright               |

The three journeys from the brief — browse → filter → product → cart; admin create →
catalog; language switch keeping route, filters and cart — exist at both the integration
level (`src/app/flows.test.tsx`) and the e2e level. Coverage is enforced at 80% for lines,
branches, functions and statements (`vite.config.ts`), and CI runs `test:coverage`.

## CI and deploy

`.github/workflows/ci.yml`: lint → typecheck → test (with coverage) → build → bundle
report, then Playwright in a second job that reuses the npm cache and caches the browser.
Runs on every pull request and on `main`.

`vercel.json` (and an equivalent `netlify.toml`) rewrite every path to `index.html` for
the SPA router, cache hashed assets for a year and keep the service worker uncached. Import
the repository into Vercel or Netlify and every pull request gets a preview deploy; there is
nothing to configure and no environment variable to set, because there is no backend.

## Measured (prompt 12 checkpoint)

Lighthouse against `vite preview` of the production build. Best Practices reads 96 in the
build sandbox only because its proxy blocks Google Fonts (one console error); it is 100
wherever the font request succeeds.

| Page       | Preset                     | Perf | A11y | BP   | SEO | LCP   | CLS  | TBT    |
| ---------- | -------------------------- | ---- | ---- | ---- | --- | ----- | ---- | ------ |
| `/`        | Desktop                    | 99   | 100  | 96\* | 100 | 0.8 s | 0.02 | 10 ms  |
| `/catalog` | Desktop                    | 99   | 100  | 96\* | 100 | 0.8 s | 0    | 0 ms   |
| `/`        | Mobile, simulated slow 4G  | 88   | 100  | 96\* | 100 | 3.1 s | 0    | 130 ms |
| `/catalog` | Mobile, simulated slow 4G  | 84   | 100  | 96\* | 100 | 3.7 s | 0    | 110 ms |
| `/`        | Mobile, applied throttling | —    | 100  | 96\* | 100 | 1.6 s | 0    | —      |

Mobile performance did not reach 95. The remaining cost is the entry JavaScript — 166 KB
gzip of React DOM, React Router (data router), Redux Toolkit Query and i18next that must
download and evaluate before a SPA can paint — and it went from 186 KB to 166 KB in this
step (decisions 56–58). Getting the rest would mean pre-rendering the routes or replacing
those libraries, both outside "harden what exists". The app shell (decision 59) fixes the
experience the simulation cannot see: with real throttling the hero is on screen at 1.6 s.

Bundle: `npm run build:report` lists every chunk with its gzip size and fails above 200 KB.
Largest chunks: the mock backend (156 KB, deferred past first paint), the entry (99 KB).

Also verified in Chromium: no horizontal overflow on any route at 320 or 1440; exactly one
`<h1>` on every route; keyboard path — skip link, nav, language, cart, drawer with focus
trapped and returned on Escape; every focused element shows a ring; `prefers-reduced-motion`
leaves reveal elements at full opacity with no animation.

## Known rough edges

- Mobile Lighthouse performance is 84–88 against the prompt's 95 (see Measured). The cost
  is the framework stack itself; pre-rendering is the honest next step.
- The legacy `src/components`, `src/data`, `src/store` and `src/types` trees are not
  imported by anything. Delete them; nothing routed has used them since prompt 8.
- Admin is a demo behind a localStorage flag — see README, "Admin is a mock".
- `src/features/product-filters/model/filters-slice.ts` (and its test) is dead since
  decision 39. It is not exported from the feature's index; delete it.
- The product page's related grid shows at most three cards; with the six-plant seed some
  categories have only one sibling, so the row can look sparse.

## Commands

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Dev server                                    |
| `npm run lint`          | ESLint, type-aware, includes layer boundaries |
| `npm run typecheck`     | `tsc -b --noEmit`                             |
| `npm test`              | Vitest                                        |
| `npm run test:coverage` | Coverage, 80% threshold                       |
| `npm run build`         | Typecheck then production build               |
| `npm run build:report`  | Build, then list chunks and fail over 200 KB  |
| `npm run e2e`           | Playwright against the production build       |
| `npm run images`        | Regenerate AVIF/WebP variants                 |

All of `lint`, `typecheck`, `test`, `build` and `e2e` must pass at every checkpoint.
