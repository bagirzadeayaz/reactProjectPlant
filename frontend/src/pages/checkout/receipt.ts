import { z } from 'zod';
import { DELIVERY_AREAS, PLANT_SIZES, POT_STYLES } from '../../shared/commerce';

const receiptSchema = z.object({
  reference: z.string(),
  total: z.number().nonnegative(),
  count: z.number().int().positive(),
  delivery: z.enum(['delivery', 'pickup']),
  stage: z.number().int().min(0).max(3).optional(),
  subtotal: z.number().nonnegative().optional(),
  shippingFee: z.number().nonnegative().optional(),
  area: z.enum(DELIVERY_AREAS).optional(),
  items: z
    .array(
      z.object({
        name: z.object({ en: z.string(), ru: z.string() }),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
        size: z.enum(PLANT_SIZES).optional(),
        pot: z.enum(POT_STYLES).optional(),
        heightCm: z.number().optional(),
      }),
    )
    .optional(),
});
export type BasketReceipt = z.infer<typeof receiptSchema>;
const KEY = 'planto:basket-receipt';
let memory: BasketReceipt | null = null;

// No name, contact or address is stored or sent to a service.
export const saveReceipt = (receipt: BasketReceipt): void => {
  memory = receipt;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(receipt));
  } catch {
    /* Session storage may be disabled. */
  }
};
export const readReceipt = (): BasketReceipt | null => {
  try {
    const result = receiptSchema.safeParse(JSON.parse(sessionStorage.getItem(KEY) ?? 'null'));
    return result.success ? result.data : memory;
  } catch {
    return memory;
  }
};
