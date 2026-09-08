import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { productDraftSchema } from '../../../entities/product/model/schema';
import { EMPTY_PRODUCT, type ProductFormValues } from './form-values';
import { issueMessage } from './issue-message';

/**
 * The form state for a product, owned by the page so it can read `isDirty`
 * for the navigation guard and hand the same object to `<ProductForm>`.
 *
 * Validation is `productDraftSchema` from `entities/product`, the same schema
 * the mock backend checks a POST against, so the form can never accept what
 * the server would refuse. The only thing added here is wording: zod issues
 * become translated messages through `issueMessage`.
 */
export const useProductForm = (
  initialValues: ProductFormValues | undefined,
): UseFormReturn<ProductFormValues> => {
  const { t } = useTranslation('validation');

  return useForm<ProductFormValues>({
    defaultValues: initialValues ?? EMPTY_PRODUCT,
    resolver: zodResolver(productDraftSchema, {
      error: (issue) => issueMessage(issue, (key, values) => t(key, values ?? {})),
    }),
    mode: 'onTouched',
  });
};
