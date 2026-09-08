import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useCreateProductMutation,
  useGetProductBySlugQuery,
  useUpdateProductMutation,
} from '../../entities/product';
import { toFormValues, type ProductFormValues } from '../../features/product-form';
import { Container, EmptyState, Skeleton } from '../../shared/ui';
import { ProductEditor } from './product-editor';

const LIST_PATH = '/admin/products';

/**
 * `/admin/products/new` and `/admin/products/:id`. Loads the product for an
 * edit, then hands both cases to `ProductEditor`, which owns the form.
 * Keying the editor on the product id means a fresh form per product — no
 * `reset()` choreography when the route changes underneath it.
 */
export const AdminProductFormPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== undefined;
  const product = useGetProductBySlugQuery(id ?? '', { skip: !isEdit });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const title = isEdit ? t('admin:edit') : t('admin:new');
  const goToList = (): void => void navigate(LIST_PATH);

  const save = async (values: ProductFormValues): Promise<void> => {
    if (isEdit) await updateProduct({ id, patch: values }).unwrap();
    else await createProduct(values).unwrap();
  };

  return (
    <Container as="section" className="flex flex-col gap-8 py-16">
      <DocumentMeta title={`${title} · ${t('common:meta.siteName')}`} robots="noindex" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-h1 font-(--font-weight-heading) text-ink">{title}</h1>
        <Link to={LIST_PATH} className="text-lg text-ink underline-offset-4 hover:underline">
          {t('admin:form.backToList')}
        </Link>
      </div>

      {isEdit && product.isLoading && (
        <div aria-busy="true" aria-label={t('admin:form.loading')}>
          <Skeleton className="h-96 w-full rounded-control" />
        </div>
      )}
      {isEdit && product.isError && <EmptyState title={t('admin:form.notFound')} />}
      {(!isEdit || product.isSuccess) && (
        <ProductEditor
          key={product.data?.id ?? 'new'}
          mode={isEdit ? 'edit' : 'create'}
          {...(product.data === undefined ? {} : { initialValues: toFormValues(product.data) })}
          onSave={save}
          onDone={goToList}
        />
      )}
    </Container>
  );
};
