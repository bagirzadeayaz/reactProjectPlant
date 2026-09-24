import { z } from 'zod';
import { localizedString } from '../../../shared/api/localized-schema';

const productText = localizedString.extend({
  en: z.string().trim().min(1).max(500),
  ru: z.string().trim().min(1).max(500),
});

/** ISO 4217. The comp prices in rupees ("Rs. 309/-", node 22:99). */
export const currencySchema = z.enum(['INR']);

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: productText,
  description: productText,
  /** Minor units are not used — the comp shows whole rupees. */
  price: z.number().int().nonnegative(),
  currency: currencySchema,
  category: z.string().min(1).max(100),
  imageUrl: z.string().min(1).max(420_000),
  inStock: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type Product = z.infer<typeof productSchema>;
export type Currency = z.infer<typeof currencySchema>;

/**
 * What a client may send when creating a product — the server owns id and
 * createdAt. The slug may be empty: the server derives one from the English
 * name, and the admin form leaves that choice to the user.
 */
export const productDraftSchema = productSchema
  .omit({ id: true, createdAt: true })
  .extend({ slug: z.string().max(100) })
  .strict();
export type ProductDraft = z.infer<typeof productDraftSchema>;

/** A partial update. Every field is optional; id travels in the URL. */
export const productPatchSchema = productDraftSchema.partial();
export type ProductPatch = z.infer<typeof productPatchSchema>;
