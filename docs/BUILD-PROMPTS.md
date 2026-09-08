# Planto — Claude Code Prompt Sequence

Build a production-quality React copy of the Figma design, pixel-faithful to the desktop
comp and responsive below it, with full product CRUD, dynamic routing, Redux Toolkit state
and EN/RU localization.

**Figma source of truth**

- File key: `jgggt59SlkGZe4CEVwebOJ`
- Target frame: `22:2` — `MacBook Pro 16" - 2`, 1728 × 7558
- Ignore: frame `3:2` (older v1), `17:175` (scrap images), `22:233` / `22:235` (device
  mockup containing a full duplicate of `22:2`)

**Status: steps 1–3 are complete and in this repo. Start at Prompt 4.**

Run the prompts in order. Each one ends with a checkpoint — do not move on until it passes.
Between prompts, review the diff yourself; Claude Code is fastest when it is corrected early.

---

## Prompt 0 — Session preamble

Paste this once at the start of the session, before Prompt 1.

```
We are building "Planto", a plant e-commerce landing page + catalog, as a React app.

The design lives in Figma. Use the Figma MCP tools to read it — never guess at values.
  File key: jgggt59SlkGZe4CEVwebOJ
  Main frame: 22:2 ("MacBook Pro 16\" - 2")
Ignore frames 3:2, 17:175, 22:233 and 22:235 entirely. 22:235 is a duplicate of 22:2 and
will only confuse you.

Ground rules for this whole session:
- TypeScript strict mode. No `any`, no non-null assertions, no ts-ignore.
- No component file over ~150 lines. Split before that.
- No magic numbers or hex colors in components — everything comes from design tokens.
- Every piece of user-visible text goes through i18n from the very first component.
  Never hardcode a string, not even a placeholder.
- Prefer composition over props explosion. If a component takes more than ~7 props,
  it probably wants to be split or take children.
- Write the test alongside the code, not after.

Before writing code in each step, tell me your plan in 5 lines or fewer and wait for my
go-ahead. Do not scaffold beyond what the current step asks for.
```

---

## Prompt 1 — Project scaffold and tooling ✅ DONE

```
Scaffold the project. Nothing else yet.

- Vite + React + TypeScript, strict mode on.
- Tailwind CSS.
- ESLint (typescript-eslint, react-hooks, jsx-a11y, import ordering) + Prettier, wired so
  they don't fight each other.
- Vitest + React Testing Library + jsdom, with a working example test.
- Husky + lint-staged: pre-commit runs lint, typecheck and tests on staged files.
- Path alias @/ pointing at src/.
- .env.example and a typed env module that validates required vars at startup and throws
  a readable error if one is missing.
- README with setup, scripts, and a short "architecture" section (leave it a stub for now).

Checkpoint: `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass
on a clean clone.
```

---

## Prompt 2 — Architecture skeleton (Feature-Sliced Design) ✅ DONE

```
Set up the folder architecture before any feature code. We are using Feature-Sliced Design.

src/
  app/        — providers, router, global styles, store wiring
  pages/      — route-level components only, no business logic
  widgets/    — composite blocks assembled from features + entities (Header, Footer, sections)
  features/   — user actions with logic (add-to-cart, product-form, language-switcher)
  entities/   — domain models and their UI (product, review)
  shared/     — ui/, lib/, api/, config/, types/ — no business knowledge, no upward imports

Rules to enforce:
- Imports may only flow downward: app → pages → widgets → features → entities → shared.
- Every slice exposes a public API via index.ts. Cross-slice imports reach only the index,
  never into internals.
- Add eslint-plugin-boundaries (or eslint-plugin-import zones) configured to make a wrong-
  direction import a lint ERROR, not a warning.

Create the directory tree with index.ts barrels and a short README.md in each layer saying
what belongs there. Add one deliberately illegal import, show me that lint catches it, then
remove it.

Checkpoint: lint fails on an upward import and passes without it.
```

---

## Prompt 3 — Design tokens from Figma ✅ DONE

```
Extract the design system from Figma frame 22:2 and encode it as tokens. Do NOT build
components yet.

Use get_design_context / get_variable_defs on these representative nodes to read real
values rather than eyeballing a screenshot:
  Nav bar            22:23
  Hero heading       22:37
  Hero paragraph     22:38
  Primary button     22:39  (180 × 58)
  Button + icon      22:70  (261 × 58 compound)
  Section heading    22:61  ("Our Trendy plants")
  Product card       22:95 / 22:96 / 22:97 / 22:98 / 22:106
  Review card        22:184
  Footer             22:209

Produce:
- An `@theme` block in src/index.css with a themed palette (semantic names — brand,
  surface, muted, on-surface — not "green1"), spacing scale, radii, shadows.
  NOTE: this project uses Tailwind v4, which is CSS-first. There is NO tailwind.config.ts;
  the `@theme` block generates the utility classes. Do not create a config file.
- A type scale as Tailwind text styles mapped from the real Figma font sizes/weights/
  line-heights. Name them by role (display, h1, h2, body, caption), not by pixel size.
- Font loading via @fontsource or self-hosted files, with font-display: swap.
- src/shared/config/tokens.ts re-exporting anything JS needs at runtime.

Note: the Figma file has NO published styles or variables — values are all raw. So derive
the scale, and where the design has near-duplicates (e.g. side margins of 67, 74 and 77px)
collapse them to ONE token and tell me which value you picked and why.

Checkpoint: a tokens preview page rendering every color, type style and spacing step.
```

---

## Prompt 4 — Shared UI kit

```
Build the primitive UI layer in shared/ui. These must be fully generic — no plant/product
knowledge in them.

- Button — variants: primary, primary-with-icon, ghost. Sizes from tokens. Renders as
  <button> or <a> polymorphically. Real focus-visible ring, disabled and loading states.
- Input, Textarea, Select — with label, error text, and correct aria-describedby wiring.
- Card, Container, Section — layout primitives carrying the page's max-width and gutters.
- Icon — a sprite or lucide-react wrapper. Pull the actual icons used in the design:
  search, bag, chevron, arrow-right, play, hamburger.
- Skeleton, Spinner, EmptyState, ErrorState.
- Modal and Toast, both keyboard-accessible: focus trap, restore focus on close, Esc to
  dismiss, correct aria roles.

Every component: typed props, forwardRef where a DOM node is exposed, a unit test covering
the interactive behavior, and an entry in a simple /ui-kit dev-only route.

Checkpoint: /ui-kit renders everything; keyboard-only navigation works across the whole page.
```

---

## Prompt 5 — Domain model, fake backend, RTK Query

```
Define the domain and its data layer. No UI in this step.

Entities (put schemas in entities/*/model, validated with zod, types inferred from schemas):
- Product: id, slug, name{en,ru}, description{en,ru}, price, currency, category,
  imageUrl, inStock, createdAt
- Review: id, author, avatarUrl, rating, text{en,ru}, productId?
- Category: id, slug, label{en,ru}

Note the localized fields — name/description/text are per-language objects, because the app
must switch EN/RU without refetching. Reflect that in the schemas.

Backend: MSW (Mock Service Worker) so it works in dev, in tests and in a static deploy.
Endpoints: GET/POST/PATCH/DELETE /products (list supports search, category filter, sort,
pagination), GET /products/:slug, GET /reviews, GET /categories.
Seed with the real content from the Figma comp — six products from nodes 22:97, 22:129,
22:109, 22:130, 22:117, 22:131 with prices from 22:99, 22:136, 22:112, 22:140, 22:120,
22:144; three reviews from 22:184, 22:183, 22:182. Write Russian translations for the
seeded copy.
Persist mutations to localStorage so added products survive a reload.

Redux Toolkit store in app/, with an RTK Query api slice for all server state. Use tag
invalidation so a create/update/delete refreshes lists automatically. Local-only UI state
(cart, filters, modal) goes in plain RTK slices — do not duplicate server state into them.

Checkpoint: integration tests proving full CRUD round-trips through MSW and that the list
cache invalidates correctly after a mutation.
```

---

## Prompt 6 — i18n (EN / RU)

```
Wire up localization with react-i18next before building pages, so nothing gets hardcoded.

- Namespaced JSON resources: common, home, catalog, product, admin, validation.
- Language detection: URL first, then localStorage, then navigator, default en.
- Persist choice; set <html lang> and document.title on change.
- Number and currency formatting via Intl, and date formatting via Intl — never manual.
- A typed t() so a missing key is a TYPE error. Generate the key union from the en JSON.
- Handle the localized entity fields from step 5: one helper, e.g. useLocalized(field),
  that picks the active language with a fallback to en.
- A CI-runnable script that fails if en and ru key sets diverge.
- LanguageSwitcher feature in features/, using shared/ui primitives.

Checkpoint: switching language updates all text, <html lang>, and currency/number
formatting, with no remount flash and no lost route state.
```

---

## Prompt 7 — Routing and layout shell

```
Set up routing and the page shell.

Routes (React Router v6, all lazy-loaded with Suspense):
  /                       home (the Figma landing page)
  /catalog                product list, with filters/sort/search reflected in the URL query
  /catalog/:slug          product detail — this is the dynamic route
  /admin/products         product management table
  /admin/products/new     create
  /admin/products/:id     edit
  *                       404

- Language prefix strategy: pick either /en/... /ru/... or a query param, argue for one in
  two sentences, implement it consistently, and make the switcher preserve the current
  route and params.
- A route-level ErrorBoundary showing ErrorState, plus a global one at the app root.
- Scroll restoration; skip-to-content link; focus moved to <h1> on navigation.
- Header and Footer as widgets, built from Figma nodes 22:23 (nav) and 22:209 (footer),
  including the mobile hamburger menu the design doesn't have — design it to match.

Checkpoint: every route loads, deep links work, back/forward behaves, and a screen reader
announces route changes.
```

---

## Prompt 8 — Home page, sections 1–4

```
Build the top half of the landing page. Read each section from Figma before writing it;
match spacing, sizes and colors to the tokens from step 3.

1. Hero — nodes 22:37 (heading), 22:38 (paragraph), 22:39 (Explore button),
   22:45 + 22:44 (Live Demo play button), background image 22:3.
2. Featured product card, right side — node 22:105. IMPORTANT: in Figma this is wrapped in
   four redundant single-child groups (22:105 → 22:102 → 22:104 → 22:103 → 22:59). Flatten
   it; build one component.
3. Floating review card — node 22:58.
4. "Our Trendy plants" heading with decorative leaf vectors — node 22:64, plus the two
   banner blocks 22:75 and 22:78.

Also note: Figma node 22:60 ("Group 50") is 990×6248 and wrongly contains both the hero
text AND a stray Explore button that belongs 6000px down the page near the "Best o2"
section. Do not reproduce that grouping — treat them as separate sections.

Responsive: the comp is 1728px desktop only. Define breakpoints yourself (suggest
sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536), and for each section describe in a comment
how it reflows. Hero goes single-column with the product card below on mobile. Nothing may
overflow horizontally at 320px.

Images: responsive srcset, width/height set to prevent CLS, lazy below the fold, eager for
the hero. Use real Unsplash-sourced plant photos or generated placeholders.

Checkpoint: side-by-side with the Figma render at 1728px, plus clean layouts at 320, 768
and 1440. No layout shift.
```

---

## Prompt 9 — Home page, sections 5–8

```
Finish the landing page.

5. "Our Top Selling" — heading 22:91, then the 6-card product grid. The grid geometry in
   the design is clean, so keep it: 512px cards at x = 77 / 608 / 1139, 19px gutters,
   77px page margins, two rows. Express that as a token-driven CSS grid, not fixed pixels.
   Card content nodes: 22:95 (image frame), 22:97 (name), 22:98 (description),
   22:106 (price + bag button).
   Build ONE ProductCard component in entities/product/ui and map over data from step 5's
   API. In Figma these six cards are hand-duplicated; do not duplicate anything here.
6. "Customer Review" — heading 22:147, cards 22:184 / 22:183 / 22:182. One ReviewCard
   component. Make it a horizontally scrollable snap carousel on mobile.
7. "Our Best o2" — heading 22:190, banner 22:194, copy 22:196 / 22:197 / 22:198, and the
   01/04 pagination arrows 22:202 / 22:203 / 22:204. Make the pagination actually work.
8. Newsletter block in the footer — node 22:226 / 22:230. In Figma this is a rectangle with
   a text layer, not a real input. Build it as a proper form: real <input type="email">,
   validation, loading state, success and error toasts.

Same responsive and image rules as step 8. Product cards: 3-up desktop, 2-up tablet, 1-up
mobile.

Checkpoint: the full page matches the comp at 1728px, and Lighthouse is ≥ 90 on
performance and 100 on accessibility.
```

---

## Prompt 10 — Catalog and product detail

```
Build the catalog and the dynamic product route. The design has no comps for these, so
extend the established visual language — reuse tokens, ProductCard and shared/ui only.

/catalog:
- Filter by category, price range and in-stock; sort by price and newest; text search
  (debounced). All state lives in the URL query so it is shareable and survives reload.
- Pagination or infinite scroll — pick one, justify it in a sentence.
- Skeletons while loading, EmptyState when filters match nothing, ErrorState with retry.

/catalog/:slug:
- Full product view: gallery, localized name and description, price, stock, add-to-cart.
- Related products from the same category.
- 404 for an unknown slug — a real 404 route, not a blank page.
- Per-page <title> and meta description in the active language via react-helmet-async.

Cart: an RTK slice persisted to localStorage, with a header badge and a drawer. Add,
remove, change quantity, clear. No checkout needed.

Checkpoint: tests cover filter-to-URL sync, an unknown slug 404, and add-to-cart surviving
a reload.
```

---

## Prompt 11 — Product management (full CRUD)

```
Build /admin/products — the "add products and do all operations with them" requirement.

- Table view: sortable columns, search, bulk select, bulk delete with confirmation.
- Create and edit forms using React Hook Form + the zod schemas from step 5 as the single
  source of validation truth. Do not write validation rules twice.
- Localized fields get side-by-side EN and RU inputs, with a clear warning if one language
  is left empty.
- Image: URL field plus drag-and-drop upload that base64s into the mock backend, with
  preview and size/type validation.
- Optimistic updates through RTK Query, with rollback and an error toast on failure.
- Delete confirmation modal. Unsaved-changes guard when navigating away from a dirty form.
- Every action produces a toast. Every async control shows a loading state.

Keep this area behind a simple client-side flag or route guard — it is a mock admin, not
real auth, and the README should say so explicitly.

Checkpoint: create a product in the admin, then see it appear on /catalog and on the home
grid without a manual refresh.
```

---

## Prompt 12 — Accessibility, performance, polish

```
Harden what exists. No new features.

Accessibility:
- Run axe on every route in tests; zero violations.
- Verify all text meets WCAG AA contrast against the tokens — the design puts white text
  over photographic backgrounds in the hero, so check that one carefully and add a scrim
  if it fails.
- Full keyboard path through every flow; visible focus everywhere; no keyboard traps.
- prefers-reduced-motion respected by every animation.
- Real landmarks, one h1 per page, no heading level skips, alt text on all images.

Performance:
- Route-level code splitting verified in the bundle report; flag any chunk over 200KB gzip.
- Images in AVIF/WebP with fallbacks, correct sizes attribute.
- Memoize only where a profile shows it helps — remove speculative memo/useCallback.
- Budget: LCP < 2.5s, CLS < 0.1, TBT < 200ms on a throttled mid-tier mobile.

Polish:
- Hover/active/focus states on every interactive element.
- Page transitions and scroll-reveal on the landing sections, motion-safe only.
- 404 and error pages styled to match the design.

Checkpoint: Lighthouse ≥ 95 across all four categories on / and /catalog.
```

---

## Prompt 13 — Testing, docs, CI, deploy

```
Close it out.

Testing:
- Unit tests for hooks, reducers, selectors and utils.
- Component tests for every shared/ui primitive and every entity component.
- Integration tests for the three flows: browse → filter → open product → add to cart;
  admin create → verify on catalog; language switch preserving route and state.
- E2E with Playwright on those same three flows, run against the MSW backend.
- Coverage threshold 80% on lines and branches, enforced in CI.

Docs:
- README: what it is, stack and why, setup, scripts, env vars, deploy.
- ARCHITECTURE.md: the FSD layers, the import rules, where state lives and why server state
  and UI state are kept separate, how i18n and the localized entity fields work, how to add
  a new feature slice.
- A short "known deviations from the Figma design" section — every place you deliberately
  differed (collapsed margins, flattened groups, invented mobile layouts, the real
  newsletter input) with the reason.
- JSDoc on public slice APIs only. No comments restating what the code says.

CI (GitHub Actions): lint → typecheck → test → build → e2e, on every PR. Cache deps.
Deploy: Vercel or Netlify config, SPA rewrite rule, preview deploys per PR.

Checkpoint: green pipeline on a fresh clone, and a live preview URL.
```

---

## Working notes

**Correct early.** If step 4's Button is wrong, everything after inherits it. Review the
diff at each checkpoint before saying continue.

**Make it re-read Figma.** If a section looks off, say so specifically — "re-read node
22:105 and check the button width, it should be 180×58" beats "the hero looks wrong."

**Push back on scope creep.** Claude Code will want to add features. The brief is: match
what's in the design first, everything else second.

**Keep a decisions log.** When you approve a judgment call — the breakpoint set, the
language-prefix strategy, the collapsed margin value — have it appended to ARCHITECTURE.md
right then. Otherwise you will re-litigate it in step 11.
