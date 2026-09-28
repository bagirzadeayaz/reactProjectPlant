import { z } from 'zod';

const receiptSchema = z.object({
  reference: z.string(),
  total: z.number().nonnegative(),
  count: z.number().int().positive(),
  delivery: z.enum(['delivery', 'pickup']),
  stage: z.number().int().min(0).max(3).optional(),
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
