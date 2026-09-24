# Project working rules

Read `README.md` for setup and `ARCHITECTURE.md` for current boundaries. Historical
notes in `docs/history/` describe earlier implementations and are not current instructions.

## Runtime structure

- `frontend/src` is React/TypeScript; `backend/src` is Node.js JavaScript.
- The single root `.env` is ignored by Git. Only public browser settings use `VITE_`.
- Do not use the Firebase CLI or sign in automatically. Google sign-in is manual.
- Backend dependencies are composed in `bootstrap.js`; services receive dependencies.
  Domain/application code must not import HTTP, Firebase adapters or environment values.
- Frontend imports flow `app -> pages -> widgets -> features -> entities -> shared`.
  Independent slices in the same layer cannot import each other. Do not relax the lint
  or architecture checks to accommodate a misplaced dependency.
- Production code never imports tests, mocks or test-only branches. Frontend test support
  lives in `frontend/test`; backend test support lives in `backend/test`.

## Implementation rules

- TypeScript stays strict: no `any`, non-null assertions or `@ts-ignore` in production.
- Use named exports and small components with one clear responsibility.
- Visible text uses EN/RU i18n. Shared UI receives text through props.
- Use design tokens from `frontend/src/index.css`; preserve the existing design.
- RTK Query owns server state; Redux slices own browser state; URL parameters own filters.
- Runtime schemas should be imported directly by their consumers to preserve code splitting.
- Keep database writes atomic where records and slug mappings must change together.
- Add meaningful tests for behavior and boundary changes, using injected dependencies.

## Verification

Run `npm run lint`, `npm run build`, `npm run test:backend`, and `npm test` after changes.
Run `npm run e2e` for changes affecting rendered flows. It uses an isolated local server
and never requires Firebase login or writes to the live project.

Update architecture documentation in the same change when a boundary or major decision
changes. Do not claim that local tests verify manually deployed Firebase rules.
