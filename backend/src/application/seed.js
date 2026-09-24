/** Per-application state; retries failures and coalesces concurrent initialization. */
export const createSeedService = ({
  repository,
  loadSeed,
  now = () => new Date().toISOString(),
}) => {
  let pending;
  const initialize = async (token) => {
    if (await repository.isComplete(token)) return;
    const seed = await loadSeed();
    for (const category of seed.categories) {
      await repository.createIfAbsent('categories', category.slug, category, token);
    }
    for (const { id, ...product } of seed.products) {
      await repository.createIfAbsent('products', id, product, token);
      await repository.createIfAbsent('productSlugs', product.slug, { productId: id }, token);
    }
    for (const { id, ...review } of seed.reviews) {
      await repository.createIfAbsent('reviews', id, review, token);
    }
    await repository.complete({ completedAt: now() }, token);
  };
  return {
    ensureSeeded: (token) => {
      pending ??= initialize(token).catch((error) => {
        pending = undefined;
        throw error;
      });
      return pending;
    },
  };
};
