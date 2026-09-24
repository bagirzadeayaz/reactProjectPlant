# Planto

React storefront with a Node.js API backed by Cloud Firestore. Product management uses Firebase Authentication with a server-side email allowlist. The storefront is English/Russian and keeps only cart and language preferences in the browser.

## Folders

- `frontend/`: React, Vite, styles, assets, and frontend tests.
- `backend/src/`: domain rules, application services, HTTP adapters and Firebase/Firestore infrastructure, connected by `bootstrap.js`.
- `backend/src/application/seed.js`: one-time, non-destructive seed for the six sample plants, categories, and reviews after your first admin sign-in.
- `backend/firestore.rules.template`: source for Firestore rules. `npm run rules:generate` fills in the admin email from `.env` and writes ignored `backend/firestore.rules` for manual publishing.
- `frontend/test/`: isolated test setup, HTTP mocks and fixtures.
- `e2e/`: browser tests against an isolated Node.js server; no Firebase login or live database access.
- `ARCHITECTURE.md`: current dependency rules, data flow, tradeoffs and extension points.

## Local setup

Requires Node.js 22+ and npm.

1. Run `npm ci`.
2. Check the single project-root `.env` file. Copy `.env.example` if it is missing. The supplied Firebase web app configuration and approved admin email are already filled in locally; `.env` is ignored by Git.
3. In the Firebase console, confirm the `planto-react` Standard Firestore database exists and Google is enabled in Authentication. Add `localhost` to Authentication's authorized domains if needed. Sign-in happens only when you click the admin sign-in button.
4. Run `npm run rules:generate`, then publish the generated `backend/firestore.rules` in the Firebase console. The Node.js API calls Firestore REST without a private key. Rules permit public catalog reads and allow only the verified admin email to manage products and images. They also permit narrowly validated public newsletter signups.
5. Run `npm run dev` and open `http://localhost:5173`. The frontend dev server forwards `/api` to the Node.js API on the `PORT` set in `.env`.
6. Manually sign in at `/admin/products` with the address in `ADMIN_EMAILS`. The first successful sign-in seeds the sample catalog once; later sign-ins do not restore deleted products.

No Firebase CLI or automatic Firebase login is used by this project setup.

## Configuration

The project-root `.env` holds both sets of settings. Vite exposes only variables beginning with `VITE_` to the browser; these Firebase web app values are public client configuration. The unprefixed values configure the Node.js API: project ID, Firestore database ID (assumed `(default)`), admin email allowlist, local port, and allowed frontend origin. No private credential is needed. Admin API requests must carry a Firebase ID token for the approved email; Firestore Security Rules independently enforce the same admin check on database writes.

Uploaded product images are validated (PNG, JPEG, WebP, GIF; at most 300 KB), stored as bytes in Firestore's `images` collection under a SHA-256 hash, and served through `/api/images/:hash`. Products store that URL. Pasted external image URLs must use HTTPS. A hash is an identifier; the bytes remain necessary to show the image.

The Node.js server can also serve the production frontend from `frontend/dist`. Use `npm run build` followed by `npm start` for a single-origin deployment. A static-only host cannot run this API; deploy the Node.js server and frontend together, or configure a reverse proxy that forwards `/api` to it.

## Commands

| Command                  | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `npm run dev`            | Start frontend and backend locally                       |
| `npm run dev:backend`    | Start only the Node.js API                               |
| `npm run dev:frontend`   | Start only Vite                                          |
| `npm run rules:generate` | Generate the local Firestore rules from `.env`           |
| `npm run lint`           | Lint and verify EN/RU key parity                         |
| `npm run typecheck`      | Typecheck the frontend                                   |
| `npm test`               | Frontend unit and integration tests with a mock HTTP API |
| `npm run test:backend`   | Backend API and domain tests                             |
| `npm run build`          | Typecheck and build the frontend                         |
| `npm start`              | Serve API and built frontend using `PORT`                |

The current catalog API loads all products and applies the existing bilingual search and filters in Node.js. This preserves the current UI behavior for the small catalog. Larger catalogs should add indexed query fields and cursor pagination. Product images stored in Firestore count toward document storage and reads; the 300 KB limit keeps each document below Firestore's 1 MiB limit.

Run `npm run check` for lint, architecture checks, build and both unit/integration suites. Run `npm run e2e` for desktop/mobile browser journeys. Backend and browser tests need no `.env` or Firebase credentials.

Browser tests use Playwright Chromium by default. If Chrome is already installed, set `PLAYWRIGHT_CHANNEL=chrome` for the test command. `E2E_PORT` optionally changes the isolated test server port (default 4173); these are test-runner overrides, not app configuration.
