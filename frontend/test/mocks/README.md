# Frontend test doubles

These MSW handlers model API responses for component and RTK Query integration tests.
They run only under frontend/test/setup.ts. No production module imports this folder.

- db.ts: in-memory catalog fixture, reset after every test.
- seed.ts: deterministic product/category/review examples.
- handlers.ts, query.ts, slug.ts: simulated HTTP behavior for UI tests.
- admin-session.ts: manual sign-in state double; never used by the application.
- newsletter.ts: records submissions for assertions, without browser storage.

Backend tests validate the real application services and Firestore adapters. Browser tests
use those services with isolated repositories instead of MSW or the live Firebase project.
