import { z } from 'zod';
import { localizedString } from '../../../shared/api/localized-schema';

export const categorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  label: localizedString,
});

export type Category = z.infer<typeof categorySchema>;
