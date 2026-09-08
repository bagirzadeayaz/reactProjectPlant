import { z } from 'zod';
import { localizedString } from '../../../shared/api/localized-schema';

export const reviewSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  avatarUrl: z.string().min(1),
  /** Node 22:154 draws five stars. */
  rating: z.number().int().min(1).max(5),
  text: localizedString,
  /** Absent on the standalone testimonials in the Customer Review section. */
  productId: z.string().min(1).optional(),
});

export type Review = z.infer<typeof reviewSchema>;
