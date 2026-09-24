# Application contracts

Each service is a factory that receives its dependencies. Services do not read environment
variables, create Firebase clients, listen for HTTP requests, or import infrastructure.
Business failures use `AppError` codes; the HTTP adapter chooses response status codes.

The following asynchronous repository contracts are implemented by `infrastructure/firestore`:

- Products: `list()`, `get(id)`, `find(idOrSlug)`, `hasCategory(slug)`, `hasSlug(slug)`,
  `create(product, token)`, `update(product, previousRecord, token)`, `delete(record, token)`.
  A record is `{ product, version }`; `version` is opaque to the application. Mutations
  atomically update both the product and its slug reservation, rejecting version conflicts.
- Images: `get(hash)` and `createIfAbsent(hash, data, token)`.
- Content: `listCategories()`, `listReviews(productId)`, `subscribe(id, data)`.
- Seed: `isComplete(token)`, `createIfAbsent(collection, id, data, token)`, `complete(data, token)`.
- Authentication: `verifyIdToken(token)` returns verified Firebase identity claims.

`null` means a missing record. A duplicate conditional write raises `CONFLICT`;
`createIfAbsent` operations treat duplicates as success. Infrastructure failures must not
expose credentials or raw upstream responses. Clock and ID generators can be supplied in tests.
