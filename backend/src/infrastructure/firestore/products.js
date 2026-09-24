const record = (document) =>
  document && {
    product: { ...document.data, id: document.id },
    version: document.updateTime,
  };

/** Product + slug changes are atomic; versions prevent lost concurrent updates. */
export const createProductRepository = (db) => {
  const get = async (id) => record(await db.get('products', id));
  return {
    get,
    list: async () => (await db.list('products')).map((document) => record(document).product),
    find: async (key) => {
      const byId = await get(key);
      if (byId) return byId;
      const mapping = await db.get('productSlugs', key);
      return mapping ? get(mapping.data.productId) : null;
    },
    hasCategory: async (slug) => Boolean(await db.get('categories', slug)),
    hasSlug: async (slug) => Boolean(await db.get('productSlugs', slug)),
    create: ({ id, ...product }, token) =>
      db.commit(
        [
          db.updateWrite('products', id, product),
          db.updateWrite('productSlugs', product.slug, { productId: id }),
        ],
        token,
      ),
    update: ({ id, ...product }, previous, token) => {
      const writes = [db.updateWrite('products', id, product, { updateTime: previous.version })];
      if (product.slug !== previous.product.slug)
        writes.push(
          db.updateWrite('productSlugs', product.slug, { productId: id }),
          db.deleteWrite('productSlugs', previous.product.slug),
        );
      return db.commit(writes, token);
    },
    delete: ({ product, version }, token) =>
      db.commit(
        [
          db.deleteWrite('products', product.id, { updateTime: version }),
          db.deleteWrite('productSlugs', product.slug),
        ],
        token,
      ),
  };
};
