import type { FetchArgs } from '@reduxjs/toolkit/query';
import {
  Bytes,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';
import seed from './seed.json';

interface Product {
  id: string;
  slug: string;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  price: number;
  currency: 'AZN';
  category: string;
  imageUrl: string;
  inStock: boolean;
  createdAt: string;
}

type ProductDraft = Omit<Product, 'id' | 'createdAt'>;
type ProductPatch = Partial<ProductDraft>;

const database = getFirestore(firebaseApp);
const ADMIN_EMAIL = 'bagirzadeayaz2005@gmail.com';

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '');

const asParams = (value: FetchArgs['params']): URLSearchParams => {
  const params = new URLSearchParams();
  if (!value) return params;
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined && item !== null) params.set(key, String(item));
  }
  return params;
};

const positive = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nonNegative = (value: string | null): number | null => {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const resolveStoredImage = async (imageUrl: string): Promise<string> => {
  const match = /^\/api\/images\/([a-f0-9]{64})$/.exec(imageUrl);
  if (!match?.[1]) return imageUrl;
  const snapshot = await getDoc(doc(database, 'images', match[1]));
  if (!snapshot.exists()) return imageUrl;
  const data = snapshot.data() as { bytes?: Bytes; contentType?: string };
  if (!(data.bytes instanceof Bytes) || !data.contentType) return imageUrl;
  const bytes = data.bytes.toUint8Array();
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${data.contentType};base64,${btoa(binary)}`;
};

const prepareImage = async (
  imageUrl: string,
): Promise<{ url: string; hash?: string; bytes?: Bytes; contentType?: string }> => {
  if (!imageUrl.startsWith('data:')) return { url: imageUrl };
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    imageUrl,
  );
  if (!match?.[1] || !match[2]) throw new Error('Invalid image data');
  const raw = atob(match[2]);
  const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0));
  if (bytes.length === 0 || bytes.length > 300 * 1024) throw new Error('Invalid image size');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return {
    url: `/api/images/${hash}`,
    hash,
    bytes: Bytes.fromUint8Array(bytes),
    contentType: match[1],
  };
};

const productFrom = async (id: string, data: Omit<Product, 'id'>): Promise<Product> => ({
  ...data,
  id,
  // Older records predate the storefront's switch to Azerbaijani manat.
  currency: 'AZN',
  imageUrl: await resolveStoredImage(data.imageUrl),
});

const listProducts = async (params: URLSearchParams) => {
  const snapshots = await getDocs(collection(database, 'products'));
  const products = snapshots.empty
    ? (seed.products as Product[])
    : await Promise.all(
        snapshots.docs.map((snapshot) =>
          productFrom(snapshot.id, snapshot.data() as Omit<Product, 'id'>),
        ),
      );
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const category = params.get('category');
  const minPrice = nonNegative(params.get('minPrice'));
  const maxPrice = nonNegative(params.get('maxPrice'));
  const inStock = params.get('inStock') === 'true';
  const sort = params.get('sort') ?? 'newest';
  const page = positive(params.get('page'), 1);
  const perPage = Math.min(positive(params.get('perPage'), 6), 100);
  const comparators: Record<string, (a: Product, b: Product) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'name-asc': (a, b) => a.name.en.localeCompare(b.name.en),
  };
  const filtered = products
    .filter(
      (product) =>
        search === '' ||
        product.name.en.toLowerCase().includes(search) ||
        product.name.ru.toLowerCase().includes(search),
    )
    .filter((product) => category === null || category === '' || product.category === category)
    .filter((product) => minPrice === null || product.price >= minPrice)
    .filter((product) => maxPrice === null || product.price <= maxPrice)
    .filter((product) => !inStock || product.inStock)
    .sort(comparators[sort] ?? comparators.newest);
  const start = (page - 1) * perPage;
  return { items: filtered.slice(start, start + perPage), total: filtered.length, page, perPage };
};

const findProduct = async (key: string): Promise<Product> => {
  let snapshot = await getDoc(doc(database, 'products', key));
  if (!snapshot.exists()) {
    const mapping = await getDoc(doc(database, 'productSlugs', key));
    if (mapping.exists())
      snapshot = await getDoc(doc(database, 'products', String(mapping.data().productId)));
  }
  if (!snapshot.exists()) {
    const fallback = (seed.products as Product[]).find(
      (product) => product.id === key || product.slug === key,
    );
    if (fallback) return fallback;
    throw new Error('Product not found');
  }
  return productFrom(snapshot.id, snapshot.data() as Omit<Product, 'id'>);
};

const createProduct = async (draft: ProductDraft): Promise<Product> => {
  const id = doc(collection(database, 'products')).id;
  const base = toSlug(draft.slug || draft.name.en);
  if (!base) throw new Error('Invalid product slug');
  const image = await prepareImage(draft.imageUrl);
  return runTransaction(database, async (transaction) => {
    if (!(await transaction.get(doc(database, 'categories', draft.category))).exists())
      throw new Error('Unknown category');
    let slug = base;
    for (let suffix = 1; suffix < 1000; suffix += 1) {
      slug = suffix === 1 ? base : `${base}-${String(suffix)}`;
      if (!(await transaction.get(doc(database, 'productSlugs', slug))).exists()) break;
      if (suffix === 999) throw new Error('No available product slug');
    }
    const imageReference = image.hash ? doc(database, 'images', image.hash) : null;
    const existingImage = imageReference ? await transaction.get(imageReference) : null;
    const product: Product = {
      ...draft,
      id,
      slug,
      imageUrl: image.url,
      createdAt: new Date().toISOString(),
    };
    const { id: productId, ...stored } = product;
    if (imageReference && !existingImage?.exists())
      transaction.set(imageReference, {
        bytes: image.bytes,
        contentType: image.contentType,
        createdAt: new Date().toISOString(),
      });
    transaction.set(doc(database, 'products', productId), stored);
    transaction.set(doc(database, 'productSlugs', slug), { productId });
    return product;
  });
};

const updateProduct = async (id: string, patch: ProductPatch): Promise<Product> =>
  prepareImage(patch.imageUrl ?? '').then((image) =>
    runTransaction(database, async (transaction) => {
      const reference = doc(database, 'products', id);
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Product not found');
      const current = { ...snapshot.data(), id } as Product;
      if (
        patch.category &&
        !(await transaction.get(doc(database, 'categories', patch.category))).exists()
      )
        throw new Error('Unknown category');
      const changes = Object.fromEntries(
        Object.entries(patch).filter(([key, value]) => !(key === 'slug' && value === '')),
      ) as ProductPatch;
      const slug = changes.slug ? toSlug(changes.slug) : current.slug;
      if (!slug) throw new Error('Invalid product slug');
      if (
        slug !== current.slug &&
        (await transaction.get(doc(database, 'productSlugs', slug))).exists()
      )
        throw new Error('Product slug already exists');
      const imageReference = image.hash ? doc(database, 'images', image.hash) : null;
      const existingImage = imageReference ? await transaction.get(imageReference) : null;
      const product: Product = {
        ...current,
        ...changes,
        slug,
        ...(patch.imageUrl === undefined ? {} : { imageUrl: image.url }),
      };
      const { id: productId, ...stored } = product;
      if (imageReference && !existingImage?.exists())
        transaction.set(imageReference, {
          bytes: image.bytes,
          contentType: image.contentType,
          createdAt: new Date().toISOString(),
        });
      transaction.set(reference, stored);
      if (slug !== current.slug) {
        transaction.delete(doc(database, 'productSlugs', current.slug));
        transaction.set(doc(database, 'productSlugs', slug), { productId });
      }
      return product;
    }),
  );

const deleteProduct = async (id: string): Promise<void> =>
  runTransaction(database, async (transaction) => {
    const reference = doc(database, 'products', id);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Product not found');
    transaction.delete(reference);
    transaction.delete(doc(database, 'productSlugs', String(snapshot.data().slug)));
  });

export const runFirestoreRequest = async (input: string | FetchArgs): Promise<unknown> => {
  const args = typeof input === 'string' ? { url: input, method: 'GET' } : input;
  const method = args.method ?? 'GET';
  const productMatch = /^\/products\/([^/]+)$/.exec(args.url);
  if (method === 'GET' && args.url === '/products') return listProducts(asParams(args.params));
  if (method === 'GET' && productMatch?.[1])
    return findProduct(decodeURIComponent(productMatch[1]));
  if (method === 'POST' && args.url === '/products')
    return createProduct(args.body as ProductDraft);
  if (method === 'PATCH' && productMatch?.[1])
    return updateProduct(decodeURIComponent(productMatch[1]), args.body as ProductPatch);
  if (method === 'DELETE' && productMatch?.[1]) {
    await deleteProduct(decodeURIComponent(productMatch[1]));
    return undefined;
  }
  if (method === 'GET' && args.url === '/categories') {
    const snapshots = await getDocs(collection(database, 'categories'));
    if (snapshots.empty) return seed.categories;
    return snapshots.docs.map((snapshot) => {
      const data = snapshot.data() as Record<string, unknown> & { id?: string };
      return { ...data, id: data.id ?? snapshot.id };
    });
  }
  if (method === 'GET' && args.url === '/reviews') {
    const productId = asParams(args.params).get('productId');
    const snapshots = await getDocs(collection(database, 'reviews'));
    const reviews = snapshots.empty
      ? seed.reviews
      : snapshots.docs.map((snapshot) => {
          const data = snapshot.data() as Record<string, unknown> & { productId?: string };
          return { ...data, id: snapshot.id };
        });
    return reviews.filter((review) => !productId || review.productId === productId);
  }
  throw new Error(`Unsupported Firestore request: ${method} ${args.url}`);
};

export const ensureAdminSession = async (
  email: string | null,
  emailVerified: boolean,
): Promise<void> => {
  if (!emailVerified || email?.toLowerCase() !== ADMIN_EMAIL) throw new Error('Forbidden');
  const marker = doc(database, 'metadata', 'initial-seed');
  if ((await getDoc(marker)).exists()) return;
  const records = [
    ...seed.categories.map((item) => ['categories', item.slug, item] as const),
    ...seed.products.flatMap(({ id, ...product }) => [
      ['products', id, product] as const,
      ['productSlugs', product.slug, { productId: id }] as const,
    ]),
    ...seed.reviews.map(({ id, ...review }) => ['reviews', id, review] as const),
  ];
  const existing = await Promise.all(records.map(([name, id]) => getDoc(doc(database, name, id))));
  const batch = writeBatch(database);
  records.forEach(([name, id, data], index) => {
    if (!existing[index]?.exists()) batch.set(doc(database, name, id), data);
  });
  batch.set(marker, { completedAt: new Date().toISOString() });
  await batch.commit();
};

export const subscribeInFirestore = async (value: string): Promise<void> => {
  const email = value.trim().toLowerCase();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
  const id = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  await setDoc(doc(database, 'newsletterSubscribers', id), {
    email,
    subscribedAt: new Date().toISOString(),
  });
};
