import { z } from 'zod';
import { localizedString } from '../../../shared/api/localized-schema';
import { DELIVERY_AREAS, PLANT_SIZES, POT_STYLES } from '../../../shared/commerce';

const productText = localizedString.extend({
  en: z.string().trim().min(1).max(500),
  ru: z.string().trim().min(1).max(500),
});

/** ISO 4217 currency used throughout the Azerbaijani storefront. */
export const currencySchema = z.enum(['AZN']);

export const plantCareSchema = z.object({
  light: z.enum(['low', 'bright', 'direct']),
  watering: z.enum(['dry', 'top-dry', 'moist']),
  size: z.enum(['compact', 'medium', 'large']),
  effort: z.enum(['easy', 'regular']),
  humidity: z.enum(['average', 'high']),
  pets: z.enum(['safe', 'toxic', 'unknown']),
});
export type PlantCare = z.infer<typeof plantCareSchema>;

export const productVariantSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
  size: z.enum(PLANT_SIZES),
  heightCm: z.number().int().min(5).max(300),
  pot: z.enum(POT_STYLES),
  price: z.number().int().nonnegative(),
  stock: z.number().int().min(0).max(999),
  imageUrl: z.string().min(1).max(420_000),
});
export const productVariantsSchema = z
  .array(productVariantSchema)
  .max(12)
  .superRefine((variants, ctx) => {
    const ids = new Set<string>();
    const combinations = new Set<string>();
    variants.forEach((variant, index) => {
      const combination = `${variant.size}:${variant.pot}`;
      if (ids.has(variant.id) || combinations.has(combination))
        ctx.addIssue({ code: 'custom', path: [index, 'size'] });
      ids.add(variant.id);
      combinations.add(combination);
    });
  });
export const productDeliverySchema = z.object({
  areas: z.array(z.enum(DELIVERY_AREAS)).min(1).max(3),
  dispatchDays: z.number().int().min(0).max(14),
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: productText,
  description: productText,
  /** Minor units are not used — storefront prices are whole manats. */
  price: z.number().int().nonnegative(),
  currency: currencySchema,
  category: z.string().min(1).max(100),
  care: plantCareSchema.optional(),
  variants: productVariantsSchema.optional(),
  delivery: productDeliverySchema.optional(),
  imageUrl: z.string().min(1).max(420_000),
  gallery: z.array(z.string().min(1).max(420_000)).max(5).optional(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
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
  .extend({ slug: z.string().max(100), care: plantCareSchema })
  .strict();
export type ProductDraft = z.infer<typeof productDraftSchema>;

/** A partial update. Every field is optional; id travels in the URL. */
export const productPatchSchema = productDraftSchema.partial();
export type ProductPatch = z.infer<typeof productPatchSchema>;
